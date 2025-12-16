// src/features/shoppingList/model/shopping.types.ts

export type ShareStatus = 'pending' | 'active';

export interface ShoppingItem {
  id: number;
  name: string;
  checked: boolean;
}

export type ShoppingListData = {
  id: number;
  name: string;
  items: ShoppingItem[];
  order?: number;

  // Sharing
  isShared?: boolean;
  sharedWith?: string[];
  shareStatus?: 'pending' | 'active';
  isOwner?: boolean;
  ownerUsername?: string;
};
