namespace TS.Engine.Contracts
{
    public sealed class ShoppingListItemDto
    {
        public string Id { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public bool Checked { get; init; }
    }
}
