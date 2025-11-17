namespace TS.Api.Features.ShoppingList.Contracts.Sharing
{
    /// <summary>
    /// Request body for POST /api/shopping/lists/{listId}/share.
    /// </summary>
    public sealed class ShareListRequestDto
    {
        /// <summary>
        /// Target username/email of the partner to share with.
        /// </summary>
        public string Target { get; init; } = string.Empty;

        /// <summary>
        /// Whether partner acceptance is required (default: false).
        /// </summary>
        public bool? RequireAccept { get; init; }
    }
}
