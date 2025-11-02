using TS.Engine.Abstractions; // IAuthService abstraction (from engine layer)
using TS.AWS.Auth;

namespace TS.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ✅ חשוב: לגרום לשרת להאזין גם למכשירים אחרים ברשת, לא רק ל-localhost
            builder.WebHost.UseUrls("http://0.0.0.0:5005");

            // Register MVC controllers
            builder.Services.AddControllers();

            // Swagger (OpenAPI) for testing and documentation — keep only for Dev
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // ✅ CORS — allow frontend (React Native) requests
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

            // Dependency Injection setup
            builder.Services.AddScoped<IAuthService, AwsAuthService>();

            var app = builder.Build();

            // Swagger UI visible only in Development mode
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // HTTPS redirect — אפשר להשאיר, אבל לא חובה לפיתוח
            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            // Enable CORS before routing
            app.UseCors("Frontend");

            // Authorization middleware (reserved for JWT integration later)
            app.UseAuthorization();

            // Map controller endpoints
            app.MapControllers();

            app.Run();
        }
    }
}
