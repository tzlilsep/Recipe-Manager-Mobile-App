namespace TS.Engine.Abstractions
{
    // Minimal auth contract used by the API. Register is deferred for now.
    public interface IAuthService
    {
        // Sign in with username/password and return an ID token on success.
        Task<(bool Ok, string? UserId, string? IdToken, string? Error)>
            SignInAsync(string username, string password);

        // Not required by current API flow; kept for compatibility.
        Task SignOutAsync();

        // Not required by current API flow; kept for compatibility.
        Task<string?> GetUserIdAsync();
    }
}
