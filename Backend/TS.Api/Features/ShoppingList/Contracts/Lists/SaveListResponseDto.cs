namespace TS.Api.Features.ShoppingList.Contracts.Lists
{
    /// <summary>
    /// Response for PUT /api/shopping/lists/{listId}.
    /// </summary>
    public sealed class SaveListResponseDto
    {
        public bool Ok { get; init; }
        public string? Error { get; init; }
    }
}
