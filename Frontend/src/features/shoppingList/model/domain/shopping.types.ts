// src/features/shoppingList/model/shopping.types.ts

export type ShareStatus = 'pending' | 'active';

export interface ShoppingItem {
  id: number;
  name: string;
  checked: boolean;
}

export interface ShoppingListData {
  id: number;
  name: string;
  items: ShoppingItem[];
  order: number;

  isShared?: boolean;
  sharedWith?: string[]; // מזהה / ID מהענן

  shareStatus?: ShareStatus;
  isOwner?: boolean;

  sharedWithName?: string; 
}
