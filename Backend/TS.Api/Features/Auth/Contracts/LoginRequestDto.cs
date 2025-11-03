// MyApp\Backend\TS.Api\Features\Auth\Contracts\LoginRequestDto.cs
namespace TS.Api.Features.Auth.Contracts
{
    /// <summary>
    /// Request body for POST /api/auth/login.
    /// Matches the mobile app contract exactly.
    /// </summary>
    public sealed class LoginRequestDto
    {
        public string Username { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }
}
