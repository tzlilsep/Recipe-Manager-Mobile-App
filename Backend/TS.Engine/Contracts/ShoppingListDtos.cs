// Backend\TS.Engine\Contracts\ShoppingListDtos.cs
namespace TS.Engine.Contracts
{
    public sealed class ShoppingListItemDto
    {
        public string Id { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public bool Checked { get; init; }
    }

    public sealed class ShoppingListDto
    {
        public string UserId { get; init; } = string.Empty;
        public string ListId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public IReadOnlyList<ShoppingListItemDto> Items { get; init; } = Array.Empty<ShoppingListItemDto>();

        public int Order { get; init; }  

        // אופציונלי — תמיכה עתידית בשיתופים
        public bool? IsShared { get; init; }
        public IReadOnlyList<string>? SharedWith { get; init; }
    }
}
