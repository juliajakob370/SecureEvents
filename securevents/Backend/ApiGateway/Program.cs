using System.Threading.RateLimiting;
using Yarp.ReverseProxy;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

    options.AddPolicy("Frontend", policy =>
    {
        // OWASP A05 FIXED: explicit origin allowlist avoids cross-domain misconfiguration.
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddRateLimiter(options =>
{
    // OWASP A04/A07 FIXED: Gateway throttling limits abusive automated traffic.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 120,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.Use(async (context, next) =>
{
    // OWASP A05 FIXED: Security headers reduce browser-side attack surface and insecure defaults.
    // Includes anti-clickjacking and CSP protections.
    context.Response.Headers.TryAdd("X-Content-Type-Options", "nosniff");
    context.Response.Headers.TryAdd("X-Frame-Options", "DENY");
    context.Response.Headers.TryAdd("Cross-Origin-Opener-Policy", "same-origin");
    context.Response.Headers.TryAdd("Cross-Origin-Resource-Policy", "same-site");
    context.Response.Headers.TryAdd("Referrer-Policy", "no-referrer");
    context.Response.Headers.TryAdd(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "base-uri 'self'; " +
        "object-src 'none'; " +
        "frame-ancestors 'none'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' http://localhost:5000; " +
        "form-action 'self';");

    if (context.Request.IsHttps)
    {
        context.Response.Headers.TryAdd("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    await next();
});

app.UseCors("Frontend");
app.UseRateLimiter();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "api-gateway" }));
app.MapReverseProxy();
app.Run();
