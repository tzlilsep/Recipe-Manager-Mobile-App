// Frontend/src/features/shoppingList/model/storage.ts

import { ShoppingListData } from './domain/shopping.types';

const prefix = 'shopping/lists:v1:';

export type StoredItem = {
  id: string;
  name: string;
  is_checked: boolean;
  position: number;
};

export type StoredList = {
  listId: string;
  name: string;
  orderForUser: number;
  isOwner: boolean;
  ownerUsername: string;
  isShared: boolean;
  items: StoredItem[];
  sharedWith: string[];
};

// normalize legacy records (adds missing fields)
function normalize(list: any): StoredList {
  return {
    listId: String(list.listId ?? list.id ?? ''),
    name: String(list.name ?? ''),
    orderForUser: Number.isFinite(list.orderForUser) ? list.orderForUser : 0,
    isOwner: !!list.isOwner,
    ownerUsername: String(list.ownerUsername ?? ''),
    isShared: !!list.isShared,
    items: Array.isArray(list.items)
      ? list.items.map((it: any) => ({
          id: String(it.id ?? ''),
          name: String(it.name ?? ''),
          is_checked: !!it.is_checked,
          position: Number.isFinite(it.position) ? it.position : 0,
        }))
      : [],
    sharedWith: Array.isArray(list.sharedWith) ? list.sharedWith.map(String) : [],
  };
}

function key(userId: string) {
  return `${prefix}${userId}`;
}

// Disabled - always load from server, no local caching
export async function loadLists(userId: string | null): Promise<any[]> {
  return [];
}

export async function saveLists(userId: string | null, lists: any[]): Promise<void> {
  // No-op: don't save to local storage
}

export async function clearLists(userId: string | null): Promise<void> {
  // No-op: nothing to clear
}

// Aliases for backward compatibility
export const readCache = loadLists;
export const writeCache = saveLists;
