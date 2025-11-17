using TS.Api.Features.ShoppingList.Contracts.Lists;

namespace TS.Api.Features.ShoppingList.Contracts.Sharing
{
    /// <summary>
    /// Response for POST /api/shopping/lists/{listId}/share.
    /// </summary>
    public sealed class ShareListResponseDto
    {
        public bool Ok { get; init; }

        /// <summary>
        /// Updated full list after sharing (owner view).
        /// </summary>
        public ShoppingListDto? List { get; init; }

        /// <summary>
        /// Error code/message (e.g., "ALREADY_SHARED"), if not Ok.
        /// </summary>
        public string? Error { get; init; }
    }
}
