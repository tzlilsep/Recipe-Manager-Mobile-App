// Frontend\src\features\shoppingList\api\shopping.service.ts

import {
  ShoppingListDto,
  ShoppingItemDto,
  GetListsResponseDto,
  CreateListRequestDto,
  CreateListResponseDto,
  LoadListResponseDto,
  SaveListRequestDto,
  SaveListResponseDto,
} from './shopping.api.types';
import { ShoppingListData, ShoppingItem } from '../model/shopping.types';

/**
 * מיפוי DTO <-> מודל אפליקציה
 */
function toItem(i: ShoppingItemDto): ShoppingItem {
  return { id: Number(i.id), name: i.name, checked: i.checked };
}
function toDtoItem(i: ShoppingItem): ShoppingItemDto {
  return { id: String(i.id), name: i.name, checked: i.checked };
}

function toList(dto: ShoppingListDto): ShoppingListData {
  return {
    id: Number(dto.listId),
    name: dto.name,
    items: dto.items.map(toItem),
    order: dto.order,                 // <<< חדש
    isShared: dto.isShared,
    sharedWith: dto.sharedWith,
  };
}
function toDtoList(list: ShoppingListData): ShoppingListDto {
  return {
    listId: String(list.id),
    name: list.name,
    items: list.items.map(toDtoItem),
    order: list.order,                // <<< חדש
    isShared: list.isShared,
    sharedWith: list.sharedWith,
  };
}

/**
 * כתובת ה-API זהה ל-auth.service שלך.
 * אפשר להוציא לקובץ משותף בהמשך.
 */
const API_BASE_URL = 'http://192.168.1.51:5005/api';

/**
 * חתימה מינימלית: כל קריאה מקבלת token (Bearer) כפרמטר.
 * אם יש לך storage/Context לטוקן, אפשר להחליף בהמשך.
 */
async function http<T>(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = opts;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...rest,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `HTTP ${res.status}`);
  }
  const contentLength = res.headers.get('content-length');
  if (res.status === 204 || contentLength === '0') {
    // @ts-expect-error – no body
    return undefined;
  }
  return (await res.json()) as T;
}

/**
 * שירות ה-ShoppingList לשימוש בצד ה-UI.
 */
export const shoppingService = {
  /**
   * GET /api/shopping/lists?take=20
   * מחזיר את כל הרשימות (כל אחת עם עד N פריטים)
   */
  async getLists(token: string, take = 20): Promise<ShoppingListData[]> {
    const data = await http<GetListsResponseDto>(`/shopping/lists?take=${take}`, {
      method: 'GET',
      token,
    });
    // נמפה ו(אופציונלי) נמיין לפי order להחזרת רשימות מוכנות להצגה
    return data.lists.map(toList).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },

  /**
   * POST /api/shopping/lists
   * מאפשר לקבוע order התחלתי (אם לא מספקים — השרת יכול לשבץ לסוף)
   */
  async createList(
    token: string,
    name: string,
    id: number = Date.now(),
    order?: number               // <<< חדש: order אופציונלי
  ): Promise<ShoppingListData> {
    const body: CreateListRequestDto = { listId: String(id), name, ...(order != null ? { order } : {}) };
    const data = await http<CreateListResponseDto>('/shopping/lists', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    });
    if (!data.ok || !data.list) throw new Error(data.error || 'Create list failed');
    return toList(data.list);
  },

  /**
   * DELETE /api/shopping/lists/{listId}
   */
  async deleteList(token: string, listId: number): Promise<void> {
    await http<void>(`/shopping/lists/${listId}`, {
      method: 'DELETE',
      token,
    });
  },

  /**
   * GET /api/shopping/lists/{listId}
   * מחזיר רשימה אחת עם כל הפריטים שלה
   */
  async loadList(token: string, listId: number): Promise<ShoppingListData> {
    const data = await http<LoadListResponseDto>(`/shopping/lists/${listId}`, {
      method: 'GET',
      token,
    });
    return toList(data);
  },

  /**
   * PUT /api/shopping/lists/{listId}
   * שומר רשימה מלאה (שם + פריטים + order).
   */
  async saveList(token: string, list: ShoppingListData): Promise<void> {
    const req: SaveListRequestDto = { list: toDtoList(list) };
    const data = await http<SaveListResponseDto>(`/shopping/lists/${list.id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(req),
    });
    if (!data.ok) throw new Error(data.error || 'Save list failed');
  },

  /**
   * ✳️ נוחות: שמירת סדר אחרי גרירה עבור כמה רשימות בבת אחת.
   * אם אין לךendpoint bulk בצד שרת, זה פשוט שולח PUT לכל רשימה.
   * קראי לזה מתוך onPersist של ה-hook אחרי שמספרת מחדש את ה-order.
   */
  async saveMany(token: string, lists: ShoppingListData[]): Promise<void> {
    // אפשר Promise.all במקביל — או טורית אם חשוב הסדר:
    await Promise.all(lists.map(l => this.saveList(token, l)));
  },

  // אם בעתיד יהיה לך endpoint ייעודי לסדר (למשל PATCH /shopping/lists/order),
  // אפשר להוסיף כאן מתודה נוספת שתשלח payload מצומצם: [{listId, order}, ...].
};
