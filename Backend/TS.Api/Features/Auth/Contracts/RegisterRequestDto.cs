namespace TS.Api.Features.Auth.Contracts
{
    /// <summary>
    /// Request body for POST /api/auth/register.
    /// Kept minimal to align with the current mobile app.
    /// </summary>
    public sealed class RegisterRequestDto
    {
        public string Username { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }
}
