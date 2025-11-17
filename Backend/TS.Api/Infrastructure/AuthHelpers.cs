using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using TS.Api.Infrastructure;

namespace TS.Api.Infrastructure
{
    /// <summary>
    /// Helpers for extracting authentication data from the HTTP request and JWT claims.
    /// </summary>
    public static class AuthHelpers
    {
        /// <summary>
        /// Reads the Bearer token from the Authorization header.
        /// Returns null if missing or invalid.
        /// </summary>
        public static string? GetBearerToken(HttpRequest request)
        {
            return BearerTokenReader.Read(request);
        }

        /// <summary>
        /// Returns the user identifier from JWT claims.
        /// Supports sub / nameidentifier / cognito:username.
        /// Returns null if no matching claim exists.
        /// </summary>
        public static string? GetUserId(ClaimsPrincipal user)
        {
            return user.FindFirstValue("sub")
                ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("cognito:username");
        }
    }
}
