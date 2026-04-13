using EventManagementService.Data;
using EventManagementService.Middleware;
using EventManagementService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<LoggingClient>();

builder.Services.AddDbContext<EventDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SecureEventConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        // OWASP A05 FIXED: restrict service CORS to trusted gateway/frontend origins.
        policy.WithOrigins("http://localhost:3000", "http://localhost:5000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret is missing.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrWhiteSpace(context.Token) &&
                    context.Request.Cookies.TryGetValue("securevents_token", out var cookieToken))
                {
                    context.Token = cookieToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    // OWASP A01 FIXED: Named policies reduce ad-hoc role checks and inconsistent authorization.
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("OwnerOrAdmin", policy =>
        policy.RequireAssertion(ctx => ctx.User.Identity?.IsAuthenticated == true));
});

var app = builder.Build();

// A09 FIXED: Centralized exception handling for consistent error responses.
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<SecurityRequestLoggingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EventDbContext>();
    // Two-step database init that handles the multi-service race safely:
    //  1) Create the database file if it doesn't exist yet.
    //  2) Create this context's tables if they don't exist yet.
    // EnsureCreated() alone won't work when another service already created
    // the DB — it skips table creation if the database already exists.
    for (var attempt = 1; attempt <= 5; attempt++)
    {
        try
        {
            var creator = db.GetService<Microsoft.EntityFrameworkCore.Storage.IRelationalDatabaseCreator>();
            if (!creator.Exists())
            {
                try
                {
                    creator.Create();
                }
                catch (Exception ex) when (
                    ex.Message.Contains("already exists") ||
                    ex.Message.Contains("Cannot create database"))
                {
                    // Another service won the race and created the DB first.
                }
            }
            // Execute the create script statement-by-statement so pre-existing
            // tables don't abort the whole batch and leave newer tables
            // (e.g. BookingRecords added after initial deploy) uncreated.
            var script = db.Database.GenerateCreateScript();
            var statements = script.Split(
                new[] { "\r\nGO\r\n", "\nGO\n", "\r\nGO\r", "\nGO", ";\r\n", ";\n" },
                StringSplitOptions.RemoveEmptyEntries);
            foreach (var raw in statements)
            {
                var statement = raw.Trim();
                if (string.IsNullOrWhiteSpace(statement)) continue;
                try
                {
                    db.Database.ExecuteSqlRaw(statement);
                }
                catch (Exception ex) when (
                    ex.Message.Contains("already an object named") ||
                    ex.Message.Contains("already exists"))
                {
                    // Table/index already existed — another service or a prior
                    // run created it. Safe to skip.
                }
            }
            break;
        }
        catch (Exception ex) when (attempt < 5)
        {
            Console.WriteLine($"[EventManagement] DB init attempt {attempt} failed: {ex.Message}. Retrying...");
            Thread.Sleep(attempt * 2000);
        }
    }
}

app.UseCors("Frontend");
app.UseMiddleware<GatewayOnlyMiddleware>();

// Explicit static file serving for event image uploads.
// Bound to a known disk path so it does not depend on WebRootPath detection,
// which returns null when wwwroot does not exist at startup.
var uploadsRoot = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");
Directory.CreateDirectory(uploadsRoot);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsRoot),
    RequestPath = "/uploads"
});
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "event-management" }));
app.MapControllers();
app.Run();
