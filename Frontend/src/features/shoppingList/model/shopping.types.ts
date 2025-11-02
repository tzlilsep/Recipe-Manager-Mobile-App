// src/features/shoppingList/model/shopping.types.ts
export interface ShoppingItem {
  id: number;
  name: string;
  checked: boolean;
}

export interface ShoppingListData {
  id: number;
  name: string;
  items: ShoppingItem[];
  isShared?: boolean;
  sharedWith?: string[];
}
