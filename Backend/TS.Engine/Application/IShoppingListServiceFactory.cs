namespace TS.Engine.Application.ShoppingList
{
    public interface IShoppingListServiceFactory
    {
        IShoppingListService Create(string idToken);
    }
}
