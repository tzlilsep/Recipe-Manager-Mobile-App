using TS.Engine.Abstractions;

namespace TS.Engine.Application.ShoppingList
{
    /// <summary>
    /// Factory that creates domain-level shopping list services.
    /// Wraps the AWS service factory and injects it into the domain service.
    /// </summary>
    public sealed class ShoppingListServiceFactory : IShoppingListServiceFactory
    {
        private readonly IShoppingListDataSourceFactory _awsFactory;

        public ShoppingListServiceFactory(IShoppingListDataSourceFactory awsFactory)
        {
            _awsFactory = awsFactory;
        }

        public IShoppingListService Create(string idToken)
        {
            var aws = _awsFactory.Create(idToken);
            return new ShoppingListService(aws);
        }
    }
}
