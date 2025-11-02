using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TS.Engine.Domain.User;

namespace TS.Engine.Contracts
{
    /// <summary>
    /// Data Transfer Object representing user data exchanged between client and server.
    /// </summary>
    public sealed class UserDto
    {
        public string UserId { get; init; } = string.Empty;
        public string UserName { get; init; } = string.Empty;
        public string? Email { get; init; }
        public string? AvatarUrl { get; init; }
        public string[]? Roles { get; init; }

        public static UserDto FromDomain(User user) => new()
        {
            UserId = user.UserId,
            UserName = user.UserName
        };
    }
}
