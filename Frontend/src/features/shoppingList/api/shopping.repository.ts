// Frontend/src/features/shoppingList/api/shopping.repository.ts
import { ShoppingListData } from '../model/domain/shopping.types';
import { shoppingService } from './shopping.service';
import { sortByOrder } from '../model/domain/listOrder';

export type RepoDeps = { token?: string | null };

/**
 * Thin repository layer over shoppingService.
 * The service already normalizes server payloads to guarantee:
 * - isShared: boolean
 * - isOwner: boolean
 * - sharedWith: string[] (0..1 usernames; username is also the display name)
 *
 * This repo keeps signatures stable for the rest of the app, and:
 * - Returns sorted lists (defensive even though the service sorts as well)
 * - Chooses delete vs leave based on (isShared && !isOwner)
 * - Provides an offline create fallback with consistent sharing fields
 */
export const shoppingRepo = (deps: RepoDeps) => ({
  async fetchLists(limit = 20): Promise<ShoppingListData[]> {
    if (!deps.token) return [];
    const remote = await shoppingService.getLists(deps.token, limit);
    return sortByOrder(remote);
  },

  async saveMany(lists: ShoppingListData[]) {
    if (!deps.token) return;
    await shoppingService.saveMany(deps.token, lists);
  },

  async create(name: string, clientId: number, order: number): Promise<ShoppingListData> {
    if (!deps.token) {
      return {
        id: clientId,
        name,
        items: [],
        order,
        isOwner: true,
        isShared: false,
        sharedWith: [],
      } as ShoppingListData;
    }
    return shoppingService.createList(deps.token, name, clientId, order);
  },

  async deleteOrLeave(list: ShoppingListData) {
    if (!deps.token) return;
    if (list.isShared && !list.isOwner) {
      return shoppingService.leaveList(deps.token, list.id);
    }
    return shoppingService.deleteList(deps.token, list.id);
  },

  async leave(id: number) {
    if (!deps.token) return;
    return shoppingService.leaveList(deps.token, id);
  },

  async saveName(list: ShoppingListData, name: string) {
    if (!deps.token) return;
    return shoppingService.saveList(deps.token, { ...list, name });
  },

  async share(id: number, identifier: string) {
    if (!deps.token) throw new Error('NOT_AUTH');
    return shoppingService.shareList(deps.token, id, identifier.trim(), false);
  },
});
