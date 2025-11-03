//MyApp\Backend\TS.Engine\Abstractions\IShoppingListService.cs
using TS.Engine.Contracts;

namespace TS.Engine.Abstractions
{
    public interface IShoppingListService
    {
        Task<IReadOnlyList<ShoppingListDto>> GetListsAsync(string userId, int take);

        Task CreateListAsync(string userId, string listId, string name, int? order = null); // <<< עודכן
        Task DeleteListAsync(string userId, string listId);

        Task<ShoppingListDto> LoadAsync(string userId, string listId);

        Task SaveAsync(ShoppingListDto list); 
    }

    public interface IShoppingListServiceFactory
    {
        IShoppingListService Create(string idToken);
    }
}
