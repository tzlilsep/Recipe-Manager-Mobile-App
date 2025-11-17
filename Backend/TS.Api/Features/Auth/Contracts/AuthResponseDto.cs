// MyApp\Backend\TS.Api\Features\Auth\Contracts\AuthResponseDto.cs
namespace TS.Api.Features.Auth.Contracts
{
    /// <summary>
    /// Response shape returned to the mobile client on successful auth.
    /// Note: on errors, the API returns non-2xx with plain text (not this DTO).
    /// </summary>
    public sealed class AuthResponseDto
    {
        public bool Ok { get; init; }
        public UserDto? User { get; init; }
        public string? Token { get; init; }
        public string? RefreshToken { get; init; }
        public string? Error { get; init; } // null on success; reserved for future use if needed
    }


}
