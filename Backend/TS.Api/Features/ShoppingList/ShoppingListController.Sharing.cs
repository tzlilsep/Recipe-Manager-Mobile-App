using Microsoft.AspNetCore.Mvc;
using TS.Api.Features.ShoppingList.Contracts.Sharing;
using TS.Api.Features.ShoppingList.Mapping;
using TS.Api.Infrastructure;
using TS.Engine.Application.ShoppingList;

namespace TS.Api.Features.ShoppingList
{
    public sealed partial class ShoppingListController
    {
        /// POST /api/shopping/lists/{listId}/share
        [HttpPost("lists/{listId}/share")]
        public async Task<IActionResult> Share(string listId, [FromBody] ShareListRequestDto? body)
        {
            if (string.IsNullOrWhiteSpace(listId) || body is null || string.IsNullOrWhiteSpace(body.Target))
                return BadRequest(new ShareListResponseDto { Ok = false, Error = "Invalid request." });

            var token = AuthHelpers.GetBearerToken(Request);
            if (string.IsNullOrWhiteSpace(token))
                return Unauthorized(new ShareListResponseDto { Ok = false, Error = "Missing bearer token." });

            var userId = AuthHelpers.GetUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new ShareListResponseDto { Ok = false, Error = "Missing user identity." });

            try
            {
                var svc = _factory.Create(token);
                var updated = await svc.ShareAsync(userId!, listId, body.Target, body.RequireAccept ?? false);

                return Ok(new ShareListResponseDto
                {
                    Ok = true,
                    List = ShoppingListMapper.ToApi(updated)
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ShareListResponseDto { Ok = false, Error = ex.Message });
            }
            catch
            {
                return StatusCode(500, new ShareListResponseDto { Ok = false, Error = "Failed to share the list." });
            }
        }

        /// POST /api/shopping/lists/{listId}/leave
        [HttpPost("lists/{listId}/leave")]
        public async Task<IActionResult> Leave(string listId)
        {
            var token = AuthHelpers.GetBearerToken(Request);
            if (string.IsNullOrWhiteSpace(token))
                return Unauthorized("Missing bearer token.");

            var userId = AuthHelpers.GetUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            try
            {
                var svc = _factory.Create(token);
                await svc.LeaveAsync(userId!, listId);

                return Ok(new LeaveListResponseDto
                {
                    Ok = true,
                    ListId = listId
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new LeaveListResponseDto { Ok = false, ListId = listId, Error = ex.Message });
            }
            catch
            {
                return StatusCode(500, new LeaveListResponseDto { Ok = false, ListId = listId, Error = "Failed to leave the list." });
            }
        }
    }
}
