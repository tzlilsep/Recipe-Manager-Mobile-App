using Microsoft.AspNetCore.Mvc;
using TS.Api.Features.ShoppingList.Contracts.Lists;
using TS.Api.Features.ShoppingList.Mapping;
using TS.Api.Infrastructure;
using TS.Engine.Application.ShoppingList;

namespace TS.Api.Features.ShoppingList
{
    public sealed partial class ShoppingListController
    {
        private readonly IShoppingListServiceFactory _factory;

        public ShoppingListController(IShoppingListServiceFactory factory)
        {
            _factory = factory;
        }

        /// GET /api/shopping/lists?take=20
        [HttpGet("lists")]
        public async Task<IActionResult> GetLists([FromQuery] int take = 20)
        {
            var token = AuthHelpers.GetBearerToken(Request);
            if (string.IsNullOrWhiteSpace(token))
                return Unauthorized("Missing bearer token.");

            var userId = AuthHelpers.GetUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var svc = _factory.Create(token);
            var lists = await svc.GetListsAsync(userId!, take);

            return Ok(new GetListsResponseDto
            {
                Lists = lists.Select(ShoppingListMapper.ToApi).ToArray()
            });
        }

        /// GET /api/shopping/lists/{listId}
        [HttpGet("lists/{listId}")]
        public async Task<IActionResult> Load(string listId)
        {
            var token = AuthHelpers.GetBearerToken(Request);
            if (string.IsNullOrWhiteSpace(token))
                return Unauthorized("Missing bearer token.");

            var userId = AuthHelpers.GetUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var svc = _factory.Create(token);
            var list = await svc.LoadAsync(userId!, listId);

            return Ok(ShoppingListMapper.ToApi(list));
        }

        /// POST /api/shopping/lists
        [HttpPost("lists")]
        public async Task<IActionResult> Create([FromBody] CreateListRequestDto? body)
        {
            if (body is null || string.IsNullOrWhiteSpace(body.Name) || string.IsNullOrWhiteSpace(body.ListId))
                return BadRequest("Invalid request.");

            var token = AuthHelpers.GetBearerToken(Request);
            if (string.IsNullOrWhiteSpace(token))
                return Unauthorized("Missing bearer token.");

            var userId = AuthHelpers.GetUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var svc = _factory.Create(token);

            var created = await svc.CreateAsync(userId!, body.ListId, body.Name, body.Order);

            return Ok(new CreateListResponseDto
            {
                Ok = true,
                List = ShoppingListMapper.ToApi(created)
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

            var token = AuthHelpers.GetBearerToken(Request);
            if (string.IsNullOrWhiteSpace(token))
                return Unauthorized("Missing bearer token.");

            var userId = AuthHelpers.GetUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var engineList = ShoppingListMapper.ToEngine(userId!, body.List);

            var svc = _factory.Create(token);
            await svc.SaveAsync(engineList);

            return Ok(new SaveListResponseDto { Ok = true });
        }

        /// DELETE /api/shopping/lists/{listId}
        [HttpDelete("lists/{listId}")]
        public async Task<IActionResult> Delete(string listId)
        {
            var token = AuthHelpers.GetBearerToken(Request);
            if (string.IsNullOrWhiteSpace(token))
                return Unauthorized("Missing bearer token.");

            var userId = AuthHelpers.GetUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Missing user identity.");

            var svc = _factory.Create(token);
            await svc.DeleteAsync(userId!, listId);

            return NoContent();
        }
    }
}
