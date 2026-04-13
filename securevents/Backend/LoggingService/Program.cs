using LoggingService.Data;
using LoggingService.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<LoggingDbContext>(options =>
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
    var db = scope.ServiceProvider.GetRequiredService<LoggingDbContext>();
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
            // tables don't abort the whole batch and leave newer tables uncreated.
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
                    // Table/index already existed — safe to skip.
                }
            }
            break;
        }
        catch (Exception ex) when (attempt < 5)
        {
            Console.WriteLine($"[LoggingService] DB init attempt {attempt} failed: {ex.Message}. Retrying...");
            Thread.Sleep(attempt * 2000);
        }
    }
}

app.UseCors("Frontend");
app.UseMiddleware<GatewayOnlyMiddleware>();
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "logging" }));
app.MapControllers();
app.Run();
