namespace TS.Api.Features.ShoppingList.Contracts.Sharing
{
    /// <summary>
    /// Response for POST /api/shopping/lists/{listId}/leave.
    /// </summary>
    public sealed class LeaveListResponseDto
    {
        public bool Ok { get; init; }
        public string ListId { get; init; } = string.Empty;
        public string? Error { get; init; }
    }
}
