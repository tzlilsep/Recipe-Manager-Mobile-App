namespace TS.Api.Features.Auth.Contracts
{

    /// <summary>
    /// Minimal user payload matching the client expectations.
    /// </summary>
    public sealed class UserDto
    {
        public string UserId { get; init; } = string.Empty;
        public string UserName { get; init; } = string.Empty;
    }
}
