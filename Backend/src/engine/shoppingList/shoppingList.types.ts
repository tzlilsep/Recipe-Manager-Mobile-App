
export type ShoppingItemDto = {
  id: string;
  name: string;
  checked: boolean;
};

export type ShoppingListDto = {
  listId: string;
  name: string;
  items: ShoppingItemDto[];
  order: number;

  isShared: boolean;
  sharedWith: string[];
  isOwner: boolean;
};

export type UserCtx = {
  userId: string;      // Cognito sub (users.id)
  username: string;    // users.username
};
