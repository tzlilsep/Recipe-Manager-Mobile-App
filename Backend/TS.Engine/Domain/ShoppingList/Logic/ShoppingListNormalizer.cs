// Backend/TS.Engine/Domain/ShoppingList/Logic/ShoppingListNormalizer.cs
using TS.Engine.Contracts;

namespace TS.Engine.Domain.ShoppingList.Logic
{
    /// <summary>
    /// Domain logic for:
    /// - Shared list detection
    /// - Canonical key grouping
    /// - Owner / Shared flags normalization
    /// </summary>
    public static class ShoppingListNormalizer
    {
        public static bool IsSharedLink(ShoppingListDto l)
        {
            var id = l.ListId ?? string.Empty;
            return id.Contains("SHARED", StringComparison.OrdinalIgnoreCase);
        }

        public static string CanonicalKey(ShoppingListDto l)
        {
            var id = l.ListId ?? string.Empty;

            id = id.Replace("LIST#SHARED#", string.Empty, StringComparison.OrdinalIgnoreCase)
                   .Replace("LIST#", string.Empty, StringComparison.OrdinalIgnoreCase);

            return id;
        }

        public static ShoppingListDto Normalize(ShoppingListDto l)
        {
            var sharedWith = l.SharedWith ?? Array.Empty<string>();
            var hasPartner = sharedWith.Count > 0;

            var looksLikeSharedLink = IsSharedLink(l);

            var normalizedIsShared =
                    (l.IsShared ?? false)
                    || hasPartner
                    || looksLikeSharedLink;

            var normalizedIsOwner =
                    looksLikeSharedLink
                        ? false
                        : (l.IsOwner ?? false);

            return new ShoppingListDto
            {
                UserId = l.UserId,
                ListId = l.ListId,
                Name = l.Name,
                Items = l.Items,
                Order = l.Order,

                IsShared = normalizedIsShared,
                SharedWith = sharedWith,
                ShareStatus = l.ShareStatus,
                IsOwner = normalizedIsOwner
            };
        }

        public static ShoppingListDto PickPreferred(IEnumerable<ShoppingListDto> group)
        {
            ShoppingListDto? preferred = null;

            foreach (var x in group)
            {
                if (preferred is null)
                {
                    preferred = x;
                    continue;
                }

                var xIsLink = IsSharedLink(x);
                var pIsLink = IsSharedLink(preferred);

                if (pIsLink && !xIsLink)
                    preferred = x;
            }

            return preferred!;
        }
    }
}
