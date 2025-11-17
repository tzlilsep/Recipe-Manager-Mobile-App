// Frontend/src/features/shoppingList/model/storage.ts


import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingListData } from './domain/shopping.types';
import { sortByOrder } from './domain/listOrder';

const CACHE_KEY = 'shopping/lists:v1'; // keep v1; we normalize legacy entries on read
export const userCacheKey = (userId?: string | null) => `${CACHE_KEY}:${userId ?? 'anon'}`;

/** Defensive normalization for legacy cached entries that may miss sharing fields. */
function normalizeCachedList(anyList: any): ShoppingListData {
  const sharedWith: string[] = Array.isArray(anyList?.sharedWith)
    ? anyList.sharedWith.slice(0, 1).map(String)
    : [];

  // Derive isShared if missing (0..1 partner by contract)
  const isShared: boolean =
    typeof anyList?.isShared === 'boolean' ? anyList.isShared : sharedWith.length > 0;

  // If isOwner is missing (legacy cache), default to true.
  // Rationale: legacy local lists were created by the current user.
  // Remote fetch later will correct any mismatch.
  const isOwner: boolean =
    typeof anyList?.isOwner === 'boolean' ? anyList.isOwner : true;

  return {
    id: Number(anyList?.id),
    name: String(anyList?.name ?? ''),
    items: Array.isArray(anyList?.items)
      ? anyList.items.map((i: any) => ({
          id: Number(i?.id),
          name: String(i?.name ?? ''),
          checked: !!i?.checked,
        }))
      : [],
    order: Number(anyList?.order ?? 0),

    // Sharing
    isShared,
    sharedWith,
    isOwner,
    shareStatus: anyList?.shareStatus,
  };
}

export async function readCache(userId?: string | null) {
  const raw = await AsyncStorage.getItem(userCacheKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    // Normalize each cached list so UI always has required fields.
    const normalized: ShoppingListData[] = parsed.map(normalizeCachedList);
    return sortByOrder(normalized);
  } catch {
    return null;
  }
}

export async function writeCache(userId: string | null | undefined, lists: ShoppingListData[]) {
  try {
    // Lists reaching here are already normalized by service/repo/controller.
    await AsyncStorage.setItem(userCacheKey(userId), JSON.stringify(sortByOrder(lists as any)));
  } catch {
    // Swallow errors: cache write failure should not break the app.
  }
}
