// Frontend\src\features\shoppingList\api\shopping.service.ts
// All comments are in English only.

import {
  ShoppingListDto,
  ShoppingItemDto,
  GetListsResponseDto,
  CreateListRequestDto,
  CreateListResponseDto,
  LoadListResponseDto,
  SaveListRequestDto,
  SaveListResponseDto,
  ShareListRequestDto,
  ShareListResponseDto,
  LeaveListResponseDto,
} from './shopping.api.types';
import { ShoppingListData, ShoppingItem } from '../model/domain/shopping.types';

/** Stable numeric id helper for string/UUID ids coming from the server. */
function toStableNumericId(src: string): number {
  const n = Number(src);
  if (Number.isFinite(n)) return n;
  let h = 0;
  for (let i = 0; i < src.length; i++) {
    h = ((h << 5) - h) + src.charCodeAt(i);
    h |= 0; // force 32-bit
  }
  return Math.abs(h) + 1;
}

/** In-memory mapping between UI numeric ids and server canonical ids */
const idToCanonical = new Map<number, string>();
const canonicalToId = new Map<string, number>();

function rememberIdMapping(canonicalId: string): number {
  const existing = canonicalToId.get(canonicalId);
  if (existing) return existing;
  const numeric = toStableNumericId(canonicalId);
  canonicalToId.set(canonicalId, numeric);
  idToCanonical.set(numeric, canonicalId);
  return numeric;
}

function canonicalOf(numericId: number): string {
  // Prefer mapping (correct), fall back to stringified number (best effort)
  return idToCanonical.get(numericId) ?? String(numericId);
}

/** DTO <-> Model: items */
function toItem(i: ShoppingItemDto): ShoppingItem {
  return { id: toStableNumericId(i.id), name: i.name, checked: i.checked };
}
function toDtoItem(i: ShoppingItem): ShoppingItemDto {
  return { id: String(i.id), name: i.name, checked: i.checked };
}

/**
 * Ensures server payload has consistent sharing fields.
 * - sharedWith: always an array
 * - isShared: always boolean
 * - isOwner: always boolean
 */
function normalizeServerList(dto: ShoppingListDto): ShoppingListDto {
  const sharedWithArray = Array.isArray(dto.sharedWith) ? dto.sharedWith : [];
  const isShared =
    typeof dto.isShared === 'boolean' ? dto.isShared : sharedWithArray.length > 0;
  const isOwner =
    typeof dto.isOwner === 'boolean' ? dto.isOwner : false;

  return {
    ...dto,
    sharedWith: sharedWithArray,
    isShared,
    isOwner,
  };
}

/** DTO -> App model (and remember the mapping) */
function toList(rawDto: ShoppingListDto): ShoppingListData {
  const dto = normalizeServerList(rawDto);

  const numericId = rememberIdMapping(dto.listId);

  return {
    id: numericId,
    name: dto.name,
    items: dto.items.map(toItem),
    ...(dto.order != null ? { order: dto.order } : {}),

    // Sharing
    isShared: dto.isShared,
    sharedWith: dto.sharedWith,
    shareStatus: dto.shareStatus,
    isOwner: dto.isOwner,
    ownerUsername: (dto as any).ownerUsername,
  };
}

const API_BASE_URL = 'http://192.168.1.51:5005/api';

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

export const shoppingService = {
  /** GET lists: guarantees normalized sharing fields for every item, then dedupes by canonicalId */
  async getLists(token: string, take = 20): Promise<ShoppingListData[]> {
    const data = await http<GetListsResponseDto>(`/shopping/lists?take=${take}`, {
      method: 'GET',
      token,
    });

    // De-duplicate by canonical listId
    const byCanonical = new Map<string, ShoppingListDto>();
    for (const dto of data.lists) {
      const n = normalizeServerList(dto);
      const prev = byCanonical.get(n.listId);
      if (!prev) {
        byCanonical.set(n.listId, n);
      } else {
        // prefer shared & with more items
        const pick =
          (n.isShared && !prev.isShared) ? n :
          (n.items.length > prev.items.length) ? n :
          prev;
        byCanonical.set(n.listId, {
          ...pick,
          isShared: pick.isShared || prev.isShared,
          sharedWith: (pick.sharedWith?.length ? pick.sharedWith : prev.sharedWith) ?? [],
        });
      }
    }

    return [...byCanonical.values()]
      .map(toList)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },

  /** POST create list: server will return canonical id; we remember it */
  async createList(
    token: string,
    name: string,
    id: number = Date.now(),
    order?: number
  ): Promise<ShoppingListData> {
    const body: CreateListRequestDto = {
      listId: String(id), // temp id if backend requires; response provides canonical
      name,
      ...(order != null ? { order } : {}),
    };
    const data = await http<CreateListResponseDto>('/shopping/lists', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    });
    if (!data.ok || !data.list) throw new Error(data.error || 'Create list failed');
    return toList(data.list);
  },

  /** DELETE list (owner delete) — use canonical id */
  async deleteList(token: string, listId: number): Promise<void> {
    const canonical = encodeURIComponent(canonicalOf(listId));
    await http<void>(`/shopping/lists/${canonical}`, {
      method: 'DELETE',
      token,
    });
  },

  /** POST leave list (non-owner leave) — use canonical id */
  async leaveList(token: string, listId: number): Promise<void> {
    const canonical = encodeURIComponent(canonicalOf(listId));
    const data = await http<LeaveListResponseDto>(`/shopping/lists/${canonical}/leave`, {
      method: 'POST',
      token,
    });
    if (!data.ok) throw new Error(data.error || 'Leave list failed');
  },

  /** GET single list — use canonical id */
  async loadList(token: string, listId: number): Promise<ShoppingListData> {
    const canonical = encodeURIComponent(canonicalOf(listId));
    const data = await http<LoadListResponseDto>(`/shopping/lists/${canonical}`, {
      method: 'GET',
      token,
    });
    return toList(data);
  },

  /** PUT save list — serialize with canonical id */
  async saveList(token: string, list: ShoppingListData): Promise<void> {
    const canonical = canonicalOf(list.id);
    const req: SaveListRequestDto = {
      list: {
        listId: canonical,
        name: list.name,
        items: list.items.map(toDtoItem),
        order: list.order ?? 0,
        isShared: !!list.isShared,
        sharedWith: Array.isArray(list.sharedWith) ? list.sharedWith : [],
        shareStatus: list.shareStatus,
        isOwner: !!list.isOwner,
      },
    };
    const data = await http<SaveListResponseDto>(`/shopping/lists/${encodeURIComponent(canonical)}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(req),
    });
    if (!data.ok) throw new Error(data.error || 'Save list failed');
  },

  /** PUT many lists (fan out) */
  async saveMany(token: string, lists: ShoppingListData[]): Promise<void> {
    await Promise.all(lists.map(l => shoppingService.saveList(token, l)));
  },

  /** POST share list — use canonical id */
  async shareList(
    token: string,
    listId: number,
    target: string,
    requireAccept: boolean = false
  ): Promise<ShoppingListData> {
    const canonical = encodeURIComponent(canonicalOf(listId));
    const body: ShareListRequestDto = { target, requireAccept };
    const data = await http<ShareListResponseDto>(`/shopping/lists/${canonical}/share`, {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    });
    if (!data.ok || !data.list) throw new Error(data.error || 'Share list failed');
    return toList(data.list);
  },
};
