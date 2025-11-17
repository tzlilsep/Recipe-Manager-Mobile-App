using System;
using System.Collections.Generic;

namespace TS.Api.Features.ShoppingList.Contracts.Lists
{
    /// <summary>
    /// Response for GET /api/shopping/lists.
    /// </summary>
    public sealed class GetListsResponseDto
    {
        public IReadOnlyList<ShoppingListDto> Lists { get; init; } = Array.Empty<ShoppingListDto>();
    }
}
