// MyApp\Backend\TS.Api\Program.cs
using TS.Engine.Abstractions; // IAuthService abstraction (from engine layer)
using TS.AWS.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TS.AWS.Factories;

namespace TS.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // השרת יקשיב על פורט 5005 מכל כתובת (גם ב־EC2)
            builder.WebHost.UseUrls("http://0.0.0.0:5005");

            builder.Services.AddScoped<IShoppingListDataSourceFactory, AwsShoppingListServiceFactory>();

            // Controllers (Web API)
            builder.Services.AddControllers();

            // Swagger (OpenAPI)
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // CORS — מאפשר לכל פרונט (React Native) לגשת
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

            // Auth service (Cognito)
            builder.Services.AddScoped<IAuthService, AwsAuthService>();

            // JWT Authentication מול Cognito
            builder.Services
               .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
               .AddJwtBearer(options =>
               {
                   var authority = "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_dT2wx55fl";

                   options.Authority = authority;

                   options.TokenValidationParameters = new TokenValidationParameters
                   {
                       ValidateIssuer = true,
                       ValidIssuer = authority,
                       ValidateAudience = false
                   };

                   options.IncludeErrorDetails = true;
               });

            builder.Services.AddAuthorization();

            var app = builder.Build();

            // ✅ Swagger תמיד זמין (גם ב־EC2)
            app.UseSwagger();
            app.UseSwaggerUI();

            // ❌ מבטלים HTTPS Redirect בינתיים (עובדים עם HTTP על פורט 5005)
            // אם תרצי בעתיד HTTPS ודומיין, נוסיף את זה מחדש.

            // CORS לפני Routing
            app.UseCors("Frontend");

            // Authentication ואז Authorization
            app.UseAuthentication();
            app.UseAuthorization();

            // Map controller endpoints
            app.MapControllers();

            app.Run();
        }
    }
}
