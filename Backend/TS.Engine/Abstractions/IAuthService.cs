//MyApp\Backend\TS.Engine\Abstractions\IAuthService.cs
namespace TS.Engine.Abstractions
{
    // Minimal auth contract used by the API. Register is deferred for now.
    public interface IAuthService
    {
        // Sign in with username/password and return an ID token on success.
        Task<(bool Ok, string? UserId, string? IdToken, string? Error)>
            SignInAsync(string username, string password);

    }
}
