// Backend/TS.Engine/Abstractions/IShoppingListServiceFactory.cs

namespace TS.Engine.Abstractions
{
    public interface IShoppingListDataSourceFactory
    {
        IShoppingListDataSource Create(string idToken);
    }
}
