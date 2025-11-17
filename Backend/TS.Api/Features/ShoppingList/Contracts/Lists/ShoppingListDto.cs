using System;
using System.Collections.Generic;

namespace TS.Api.Features.ShoppingList.Contracts.Lists
{
    /// <summary>
    /// Public API DTO returned to the mobile app.
    /// </summary>
    public sealed class ShoppingListDto
    {
        public string ListId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;

        /// <remarks>Items must be the full list; never partial.</remarks>
        public IReadOnlyList<ShoppingListItemDto> Items { get; init; } = Array.Empty<ShoppingListItemDto>();

        /// <remarks>Persisted ordering index.</remarks>
        public int Order { get; init; }

        // --- Sharing (aligned with frontend) ---

        /// <summary>
        /// Whether the list is shared for the current user (single partner).
        /// </summary>
        public bool IsShared { get; init; } = false;

        /// <summary>
        /// Usernames (0..1). Empty when not shared.
        /// </summary>
        public IReadOnlyList<string> SharedWith { get; init; } = Array.Empty<string>();

        /// <summary>
        /// Optional sharing status (e.g., "pending" | "active").
        /// </summary>
        public string? ShareStatus { get; init; }

        /// <summary>
        /// Whether the current user is the owner of this list.
        /// </summary>
        public bool IsOwner { get; init; } = true;
    }
}
