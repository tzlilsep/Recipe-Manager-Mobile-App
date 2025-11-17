namespace TS.Engine.Contracts
{
    public sealed class ShoppingListDto
    {
        public string UserId { get; init; } = string.Empty;
        public string ListId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public IReadOnlyList<ShoppingListItemDto> Items { get; init; } = Array.Empty<ShoppingListItemDto>();

        public int Order { get; init; }

        // --- שיתוף (תואם ל-API/Frontend) ---
        public bool? IsShared { get; init; }
        public IReadOnlyList<string>? SharedWith { get; init; }

        // <<< חדשים: נדרשים ל־Controller/Frontend
        public string? ShareStatus { get; init; }  // "pending" | "active"
        public bool? IsOwner { get; init; }        // האם המשתמש הנוכחי הוא הבעלים
    }
}
