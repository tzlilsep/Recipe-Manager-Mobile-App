using System;

namespace TS.Api.Features.ShoppingList.Contracts.Lists
{
    /// <summary>
    /// Single shopping list item.
    /// </summary>
    public sealed class ShoppingListItemDto
    {
        public string Id { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public bool Checked { get; init; }
    }
}
