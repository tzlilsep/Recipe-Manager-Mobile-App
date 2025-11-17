namespace TS.Api.Features.ShoppingList.Contracts.Lists
{
    /// <summary>
    /// Response for POST /api/shopping/lists.
    /// </summary>
    public sealed class CreateListResponseDto
    {
        public bool Ok { get; init; }
        public ShoppingListDto? List { get; init; }
        public string? Error { get; init; }
    }
}
