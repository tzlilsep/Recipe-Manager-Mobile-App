// MyApp\Backend\TS.AWS\Factories\AwsShoppingListServiceFactory.cs
using TS.Engine.Abstractions;
using TS.AWS.Services;


namespace TS.AWS.Factories
{
    public sealed class AwsShoppingListServiceFactory : IShoppingListDataSourceFactory
    {
        public IShoppingListDataSource Create(string idToken)
            => new AwsShoppingListService(idToken);
    }
}
