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

            // ✅ חשוב: לגרום לשרת להאזין גם למכשירים אחרים ברשת, לא רק ל-localhost
            builder.WebHost.UseUrls("http://0.0.0.0:5005");

            builder.Services.AddScoped<IShoppingListServiceFactory, AwsShoppingListServiceFactory>();

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

            // ✅ הוספת אימות JWT (Cognito)
            builder.Services
           .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
           .AddJwtBearer(options =>
    {
        // ה־User Pool שלך (כבר נכון)
        var authority = "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_dT2wx55fl";

        options.Authority = authority;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            // 👇 השורה החסרה שגורמת לשגיאת IDX10204 להיעלם
            ValidIssuer = authority,

            // להשאיר פשוט כרגע
            ValidateAudience = false
            // אם תרצי לנעול ל-App Client מסוים:
            // ValidateAudience = true,
            // ValidAudience = "<app client id>"
        };

        // עוזר בדיבוג במקרה ויהיו עוד שגיאות
        options.IncludeErrorDetails = true;
    });


            builder.Services.AddAuthorization();

            // ❗ אם יש לך מימוש בפועל של IShoppingListServiceFactory – רשמי אותו כאן:
            // builder.Services.AddScoped<IShoppingListServiceFactory, YourShoppingListServiceFactory>();

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

            // ✅ סדר ביניים נכון: קודם Authentication ואז Authorization
            app.UseAuthentication();
            app.UseAuthorization();

            // Map controller endpoints
            app.MapControllers();

            app.Run();
        }
    }
}
