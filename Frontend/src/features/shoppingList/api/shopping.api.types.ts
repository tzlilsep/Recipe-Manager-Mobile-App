// MyApp\Frontend\src\features\shoppingList\api\shopping.api.types.ts

export interface ShoppingItemDto {
  id: string;        
  name: string;
  checked: boolean;
}

export interface ShoppingListDto {
  listId: string;     
  name: string;
  items: ShoppingItemDto[];
  order: number;              // <<< חדש: נשמר ומוחזר מהשרת
  // הרחבות עתידיות:
  isShared?: boolean;
  sharedWith?: string[];
}

/** GET /api/shopping/lists?take=... */
export interface GetListsResponseDto {
  lists: ShoppingListDto[];
}

/** POST /api/shopping/lists */
export interface CreateListRequestDto {
  listId: string;  
  name: string;
  order?: number;           // <<< מומלץ לאפשר קביעת סדר התחלתי מהלקוח (אופציונלי)
}
export interface CreateListResponseDto {
  ok: boolean;
  list?: ShoppingListDto;
  error?: string;
}


/** GET /api/shopping/lists/{listId} */
export type LoadListResponseDto = ShoppingListDto;

/** PUT /api/shopping/lists/{listId} */
export interface SaveListRequestDto {
  list: ShoppingListDto;     // <<< כולל כעת order בפנים
}
export interface SaveListResponseDto {
  ok: boolean;
  error?: string;
}
