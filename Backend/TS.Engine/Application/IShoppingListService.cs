// Backend/TS.Engine/Application/ShoppingList/IShoppingListDomainService.cs
using TS.Engine.Contracts;

namespace TS.Engine.Application.ShoppingList
{
    public interface IShoppingListService
    {
        Task<IReadOnlyList<ShoppingListDto>> GetListsAsync(string userId, int take);
        Task<ShoppingListDto> LoadAsync(string userId, string listId);

        Task<ShoppingListDto> CreateAsync(string userId, string listId, string name, int? order);

        Task SaveAsync(ShoppingListDto list);

        Task<ShoppingListDto> ShareAsync(string userId, string listId, string target, bool requireAccept);
        Task LeaveAsync(string userId, string listId);
        Task DeleteAsync(string userId, string listId);
    }
}
