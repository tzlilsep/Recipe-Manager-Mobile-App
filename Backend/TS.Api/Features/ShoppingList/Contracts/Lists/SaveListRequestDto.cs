namespace TS.Api.Features.ShoppingList.Contracts.Lists
{
    /// <summary>
    /// Request body for PUT /api/shopping/lists/{listId}.
    /// </summary>
    public sealed class SaveListRequestDto
    {
        /// <summary>
        /// Full list payload (treated as upsert/merge by the server).
        /// </summary>
        public ShoppingListDto List { get; init; } = new();
    }
}
