// MyApp\Backend\TS.Api\Features\ShoppingList\Contracts\ShoppingListDtos.cs
namespace TS.Api.Features.ShoppingList.Contracts
{
    public sealed class ShoppingListItemDto
    {
        public string Id { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public bool Checked { get; init; }
    }

    public sealed class ShoppingListDto
    {
        public string ListId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public IReadOnlyList<ShoppingListItemDto> Items { get; init; } = Array.Empty<ShoppingListItemDto>();

        public int Order { get; init; }  

        // אופציונלי לעתיד – תואם ל-Frontend
        public bool? IsShared { get; init; }
        public IReadOnlyList<string>? SharedWith { get; init; }
    }

    // GET /api/shopping/lists?take=20
    public sealed class GetListsResponseDto
    {
        public IReadOnlyList<ShoppingListDto> Lists { get; init; } = Array.Empty<ShoppingListDto>();
    }

    // POST /api/shopping/lists
    public sealed class CreateListRequestDto
    {
        public string ListId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public int? Order { get; init; }   // <<< חדש: אפשר לשלוח order התחלתי
    }

    public sealed class CreateListResponseDto
    {
        public bool Ok { get; init; }
        public ShoppingListDto? List { get; init; }
        public string? Error { get; init; }
    }

    // PUT /api/shopping/lists/{listId}
    public sealed class SaveListRequestDto
    {
        public ShoppingListDto List { get; init; } = new();
    }

    public sealed class SaveListResponseDto
    {
        public bool Ok { get; init; }
        public string? Error { get; init; }
    }
}
