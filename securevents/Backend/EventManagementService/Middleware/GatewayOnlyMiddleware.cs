namespace EventManagementService.Middleware;

public class GatewayOnlyMiddleware
{
    private const string HeaderName = "X-Gateway-Key";
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;

    public GatewayOnlyMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/swagger") ||
            context.Request.Path.StartsWithSegments("/health") ||
            context.Request.Path.StartsWithSegments("/uploads"))
        {
            // OWASP A01 note: /uploads serves public event images (no sensitive data),
            // so it bypasses the gateway-key check to avoid blocking direct-load <img> tags.
            await _next(context);
            return;
        }

        var expected = _configuration["Security:GatewayKey"];

        // OWASP A01 FIXED: Service endpoints are only accepted through trusted gateway.
        if (string.IsNullOrWhiteSpace(expected) || !context.Request.Headers.TryGetValue(HeaderName, out var value) || value != expected)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { message = "Direct access blocked. Use API gateway." });
            return;
        }

        await _next(context);
    }
}
