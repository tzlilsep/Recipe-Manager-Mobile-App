// Backend/TS.Engine/Application/ShoppingList/ShoppingListDomainService.cs
using TS.Engine.Abstractions;
using TS.Engine.Contracts;
using TS.Engine.Domain.ShoppingList.Logic;

namespace TS.Engine.Application.ShoppingList
{
    public sealed class ShoppingListService : IShoppingListService
    {
        private readonly IShoppingListDataSource _aws;

        public ShoppingListService(IShoppingListDataSource awsService)
        {
            _aws = awsService;
        }

        public async Task<IReadOnlyList<ShoppingListDto>> GetListsAsync(string userId, int take)
        {
            var raw = await _aws.GetListsAsync(userId, take);

            var normalized = raw.Select(ShoppingListNormalizer.Normalize);

            var deduped =
                normalized
                    .GroupBy(ShoppingListNormalizer.CanonicalKey, StringComparer.Ordinal)
                    .Select(ShoppingListNormalizer.PickPreferred)
                    .OrderBy(l => l.Order)
                    .ToArray();

            return deduped;
        }

        public async Task<ShoppingListDto> LoadAsync(string userId, string listId)
        {
            var l = await _aws.LoadAsync(userId, listId);
            return ShoppingListNormalizer.Normalize(l);
        }

        public async Task<ShoppingListDto> CreateAsync(string userId, string listId, string name, int? order)
        {
            await _aws.CreateListAsync(userId, listId, name, order);
            var l = await _aws.LoadAsync(userId, listId);
            return ShoppingListNormalizer.Normalize(l);
        }

        public Task SaveAsync(ShoppingListDto list)
        {
            return _aws.SaveAsync(list);
        }

        public async Task<ShoppingListDto> ShareAsync(string userId, string listId, string target, bool requireAccept)
        {
            var l = await _aws.ShareAsync(userId, listId, target, requireAccept);
            return ShoppingListNormalizer.Normalize(l);
        }

        public Task LeaveAsync(string userId, string listId)
        {
            return _aws.LeaveAsync(userId, listId);
        }

        public Task DeleteAsync(string userId, string listId)
        {
            return _aws.DeleteListAsync(userId, listId);
        }
    }
}
