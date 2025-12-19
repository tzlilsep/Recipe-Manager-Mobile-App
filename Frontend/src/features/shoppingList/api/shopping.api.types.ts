export interface ShoppingItemDto {
  id: string;
  name: string;
  checked: boolean;
}

export type ShareStatusDto = 'pending' | 'active';

export interface ShoppingListDto {
  listId: string;
  name: string;
  items: ShoppingItemDto[];
  orderForUser: number;        
  isShared: boolean;          
  sharedWith: string[];        
  shareStatus?: ShareStatusDto;
  isOwner: boolean;      
}

/** GET /api/shopping/lists?take=... */
export interface GetListsResponseDto {
  lists: ShoppingListDto[];
}

/** POST /api/shopping/lists */
export interface CreateListRequestDto {
  listId: string;
  name: string;
  order?: number;
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
  list: ShoppingListDto;       // includes order
}
export interface SaveListResponseDto {
  ok: boolean;
  error?: string;
}

/** --- Sharing (single partner) --- */
/** POST /api/shopping/lists/{listId}/share */
export interface ShareListRequestDto {
  target: string;              // username/email to share with
  requireAccept?: boolean;     // default: true (if server supports it)
}
export interface ShareListResponseDto {
  ok: boolean;
  list?: ShoppingListDto;      // updated list after sharing
  error?: string;              // e.g. "ALREADY_SHARED"
}

/** --- Leave a shared list (does not delete for other users) --- */
/** POST /api/shopping/lists/{listId}/leave */
export interface LeaveListResponseDto {
  ok: boolean;
  listId: string;
  error?: string;
}
