// MyApp\Backend\TS.AWS\Factories\AwsShoppingListServiceFactory.cs
using TS.Engine.Abstractions;
using TS.AWS.Services;


namespace TS.AWS.Factories
{
    public sealed class AwsShoppingListServiceFactory : IShoppingListServiceFactory
    {
        public IShoppingListService Create(string idToken)
            => new AwsShoppingListService(idToken);
    }
}
