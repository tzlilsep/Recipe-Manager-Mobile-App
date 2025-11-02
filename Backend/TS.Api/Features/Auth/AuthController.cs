using Microsoft.AspNetCore.Mvc;
using TS.Engine.Abstractions;                 // IAuthService (engine)
using TS.Api.Features.Auth.Contracts;         // DTOs

namespace TS.Api.Features.Auth
{
    [ApiController]
    [Route("api/[controller]")] // -> /api/auth
    public sealed class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth)
        {
            _auth = auth;
        }

        /// <summary>
        /// Authenticates a user via engine's IAuthService.SignInAsync and maps the result
        /// to the mobile client's contract. On error, returns status + plain text.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto? request)
        {
            if (request is null)
                return BadRequest("Invalid request body.");
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Username and password are required.");

            var (ok, userId, idToken, error) = await _auth.SignInAsync(request.Username, request.Password);

            if (!ok || string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(idToken))
            {
                // The React Native client reads res.text() on non-2xx responses.
                return Unauthorized(string.IsNullOrWhiteSpace(error) ? "Invalid credentials." : error!);
            }

            var response = new AuthResponseDto
            {
                Ok = true,
                User = new UserDto { UserId = userId!, UserName = request.Username },
                Token = idToken,
                RefreshToken = null,
                Error = null
            };

            return Ok(response);
        }

        /// <summary>
        /// Registration is not implemented in the engine abstraction yet.
        /// Returning 501 keeps the contract explicit for the client.
        /// </summary>
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequestDto? _)
        {
            return StatusCode(StatusCodes.Status501NotImplemented, "Registration is not supported.");
        }
    }
}
