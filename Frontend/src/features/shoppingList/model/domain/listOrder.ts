// Frontend/src/features/shoppingList/model/listOrder.ts
import { ShoppingListData } from './shopping.types';

export const sortByOrder = (arr: ShoppingListData[]) =>
  [...arr].sort((a: any, b: any) => {
    const ao = a.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.order ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return String(a.id).localeCompare(String(b.id));
  });

export const nextOrderFor = (lists: ShoppingListData[]) =>
  (lists.length === 0 ? 0 : Math.max(...lists.map(l => (l as any).order ?? -1)) + 1);

export const withNormalizedOrder = (lists: ShoppingListData[]) =>
  lists.map((l, idx) => ({ ...(l as any), order: idx })) as any[];
