using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TS.Api.Features.ShoppingList.Contracts;
using TS.Api.Infrastructure;
using TS.Engine.Abstractions;
using EngineListDto = TS.Engine.Contracts.ShoppingListDto;
using EngineItemDto = TS.Engine.Contracts.ShoppingListItemDto;

namespace TS.Api.Features.ShoppingList
{
    [ApiController]
    [Route("api/shopping")]
    [Authorize]
    public sealed class ShoppingListController : ControllerBase
    {
        private readonly IShoppingListServiceFactory _factory;

        public ShoppingListController(IShoppingListServiceFactory factory)
        {
            _factory = factory;
        }

        private string? GetUserId() =>
            User.FindFirstValue("sub") ??
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("cognito:username");

        // Engine -> API
        private static ShoppingListItemDto Map(EngineItemDto i) => new()
        {
            Id = i.Id,
            Name = i.Name,
            Checked = i.Checked
        };

        private static ShoppingListDto Map(EngineListDto l) => new()
        {
            ListId = l.ListId,
            Name   = l.Name,
            Items  = l.Items.Select(Map).ToArray(),
            Order  = l.Order,   // <<< חדש
            IsShared   = l.IsShared,
            SharedWith = l.SharedWith
        };

        // API -> Engine
        private static EngineItemDto Map(ShoppingListItemDto i) => new()
        {
            Id = i.Id,
            Name = i.Name,
            Checked = i.Checked
        };

        private static EngineListDto Map(string userId, ShoppingListDto l) => new()
        {
            UserId = userId,
            ListId = l.ListId,
            Name   = l.Name,
            Items  = l.Items.Select(Map).ToArray(),
            Order  = l.Order,    // <<< חדש
            IsShared   = l.IsShared,
            SharedWith = l.SharedWith
        };

        /// GET /api/shopping/lists?take=20
        [HttpGet("lists")]
        public async Task<IActionResult> GetLists([FromQuery] int take = 20)
        {
            var idToken = BearerTokenReader.Read(Request);
            if (string.IsNullOrWhiteSpace(idToken))
                return Unauthorized("Missing bearer token.");

            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var svc = _factory.Create(idToken);
            var lists = await svc.GetListsAsync(userId!, take);

            // ממיינים לפי Order לפני ההחזרה (גם אם השירות כבר מחזיר ממוין)
            var payload = new GetListsResponseDto
            {
                Lists = lists
                    .OrderBy(l => l.Order) // <<< חשוב לעקביות
                    .Select(Map)
                    .ToArray()
            };
            return Ok(payload);
        }

        /// GET /api/shopping/lists/{listId}
        [HttpGet("lists/{listId}")]
        public async Task<IActionResult> Load(string listId)
        {
            var idToken = BearerTokenReader.Read(Request);
            if (string.IsNullOrWhiteSpace(idToken))
                return Unauthorized("Missing bearer token.");

            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var svc = _factory.Create(idToken);
            var list = await svc.LoadAsync(userId!, listId);

            return Ok(Map(list));
        }

        /// POST /api/shopping/lists
        [HttpPost("lists")]
        public async Task<IActionResult> Create([FromBody] CreateListRequestDto? body)
        {
            if (body is null || string.IsNullOrWhiteSpace(body.Name) || string.IsNullOrWhiteSpace(body.ListId))
                return BadRequest("Invalid request");

            var idToken = BearerTokenReader.Read(Request);
            if (string.IsNullOrWhiteSpace(idToken))
                return Unauthorized("Missing bearer token.");

            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var svc = _factory.Create(idToken);

            // <<< חדש: מעבירים את ה-Order אם התקבל; אחרת, ה-implementation ישבץ לסוף.
            await svc.CreateListAsync(userId!, body.ListId, body.Name, body.Order);

            // נחזיר את הרשימה שנוצרה
            var created = await svc.LoadAsync(userId!, body.ListId);

            return Ok(new CreateListResponseDto
            {
                Ok = true,
                List = Map(created)
            });
        }

        /// PUT /api/shopping/lists/{listId}
        [HttpPut("lists/{listId}")]
        public async Task<IActionResult> Save(string listId, [FromBody] SaveListRequestDto? body)
        {
            if (body is null || body.List is null || string.IsNullOrWhiteSpace(body.List.ListId))
                return BadRequest("Invalid request body.");

            if (!string.Equals(listId, body.List.ListId, StringComparison.Ordinal))
                return BadRequest("Route listId does not match body.");

            var idToken = BearerTokenReader.Read(Request);
            if (string.IsNullOrWhiteSpace(idToken))
                return Unauthorized("Missing bearer token.");

            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var engineList = Map(userId!, body.List); // <<< מעביר גם Order וגם UserId

            var svc = _factory.Create(idToken);
            await svc.SaveAsync(engineList);

            return Ok(new SaveListResponseDto { Ok = true });
        }

        /// DELETE /api/shopping/lists/{listId}
        [HttpDelete("lists/{listId}")]
        public async Task<IActionResult> Delete(string listId)
        {
            var idToken = BearerTokenReader.Read(Request);
            if (string.IsNullOrWhiteSpace(idToken))
                return Unauthorized("Missing bearer token.");

            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var svc = _factory.Create(idToken);
            await svc.DeleteListAsync(userId!, listId);

            return NoContent();
        }
    }
}
