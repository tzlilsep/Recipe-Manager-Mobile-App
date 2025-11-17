namespace TS.Api.Features.ShoppingList.Contracts.Lists
{
    /// <summary>
    /// Request body for POST /api/shopping/lists.
    /// </summary>
    public sealed class CreateListRequestDto
    {
        public string ListId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;

        /// <summary>
        /// Optional initial order for the newly created list.
        /// </summary>
        public int? Order { get; init; }
    }
}
