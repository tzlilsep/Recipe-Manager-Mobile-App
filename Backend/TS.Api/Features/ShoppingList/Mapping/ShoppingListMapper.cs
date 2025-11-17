using System;
using System.Collections.Generic;
using System.Linq;
using TS.Api.Features.ShoppingList.Contracts.Lists;
using EngineListDto = TS.Engine.Contracts.ShoppingListDto;
using EngineItemDto = TS.Engine.Contracts.ShoppingListItemDto;

namespace TS.Api.Features.ShoppingList.Mapping
{
    /// <summary>
    /// Engine <-> API mapping and normalization helpers.
    /// </summary>
    public static class ShoppingListMapper
    {
        // -----------------------------
        // Item mapping
        // -----------------------------

        public static ShoppingListItemDto ToApi(EngineItemDto i) => new()
        {
            Id = i.Id,
            Name = i.Name,
            Checked = i.Checked
        };

        public static EngineItemDto ToEngine(ShoppingListItemDto i) => new()
        {
            Id = i.Id,
            Name = i.Name,
            Checked = i.Checked
        };

        // -----------------------------
        // List mapping
        // -----------------------------

        public static ShoppingListDto ToApi(EngineListDto l) => new()
        {
            ListId = l.ListId,
            Name = l.Name,
            Items = l.Items.Select(ToApi).ToArray(),
            Order = l.Order,

            IsShared = l.IsShared ?? false,
            SharedWith = l.SharedWith ?? Array.Empty<string>(),
            ShareStatus = l.ShareStatus,
            IsOwner = l.IsOwner ?? false
        };

        public static EngineListDto ToEngine(string userId, ShoppingListDto l) => new()
        {
            UserId = userId,
            ListId = l.ListId,
            Name = l.Name,
            Items = l.Items.Select(ToEngine).ToArray(),
            Order = l.Order,

            IsShared = l.IsShared,
            SharedWith = l.SharedWith,
            ShareStatus = l.ShareStatus,
            IsOwner = l.IsOwner
        };

        // -----------------------------
        // Normalization helpers
        // -----------------------------

        private static bool IsSharedLink(EngineListDto l)
        {
            var id = l.ListId ?? string.Empty;
            return id.Contains("SHARED", StringComparison.OrdinalIgnoreCase);
        }

        public static string CanonicalKey(EngineListDto l)
        {
            var id = l.ListId ?? string.Empty;

            return id.Replace("LIST#SHARED#", string.Empty, StringComparison.OrdinalIgnoreCase)
                     .Replace("LIST#", string.Empty, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Creates a normalized EngineListDto (do not mutate original instance).
        /// </summary>
        public static EngineListDto NormalizeEngine(EngineListDto l)
        {
            var sharedWith = l.SharedWith ?? Array.Empty<string>();
            var hasPartner = sharedWith.Count > 0;
            var link = IsSharedLink(l);

            var normalizedIsShared =
                (l.IsShared ?? false) ||
                hasPartner ||
                link;

            var normalizedIsOwner =
                link ? false : (l.IsOwner ?? false);

            return new EngineListDto
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

        /// <summary>
        /// Picks the preferred list among grouped shared/non-shared versions.
        /// </summary>
        public static EngineListDto PickPreferredForGroup(IEnumerable<EngineListDto> group)
        {
            EngineListDto? preferred = null;

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
