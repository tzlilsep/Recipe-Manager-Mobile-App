import { withTx } from '../../db/db';

type UserCtx = { userId: string; username?: string };

type ShoppingListItemDto = {
  id: string;
  name: string;
  checked: boolean;
  position: number;
};

type ShoppingListDto = {
  listId: string;
  name: string;
  orderForUser: number;
  isOwner: boolean;
  ownerUsername: string;
  isShared: boolean;
  items: ShoppingListItemDto[];
  sharedWith: string[];
};

type DbListRow = {
  list_id: string;
  name: string;
  order_for_user: number;
  is_owner: boolean;
  owner_username: string;
  is_shared: boolean;
};

type DbItemRow = {
  id: string;
  list_id: string;
  name: string;
  is_checked: boolean;
  position: number;
};

export class ShoppingListService {
  // GET /shopping/lists?take=...
  static async getLists(user: UserCtx, take: number): Promise<ShoppingListDto[]> {
    const t = Number.isFinite(take) ? Math.max(1, Math.min(100, take)) : 20;

    return withTx(async (db) => {
      const listsRes = await db.query<DbListRow>(
        `
        SELECT
          sl.id AS list_id,
          sl.name,
          CASE
            WHEN sl.owner_user_id = $1 THEN sl.position
            ELSE COALESCE(sh.position, sl.position)
          END AS order_for_user,
          (sl.owner_user_id = $1) AS is_owner,
          ou.username AS owner_username,
          (sl.is_shared OR EXISTS (
            SELECT 1 FROM shopping_list_shares s2 WHERE s2.list_id = sl.id
          )) AS is_shared
        FROM shopping_lists sl
        JOIN users ou ON ou.id = sl.owner_user_id
        LEFT JOIN shopping_list_shares sh
          ON sh.list_id = sl.id AND sh.shared_with_user_id = $1
        WHERE sl.owner_user_id = $1 OR sh.shared_with_user_id = $1
        ORDER BY order_for_user ASC
        LIMIT $2
        `,
        [user.userId, t]
      );

      const listIds = listsRes.rows.map((r) => r.list_id);
      const itemsByList = new Map<string, ShoppingListItemDto[]>();

      if (listIds.length) {
        const itemsRes = await db.query<DbItemRow>(
          `
          SELECT id, list_id, name, is_checked, position
          FROM shopping_list_items
          WHERE list_id = ANY($1::uuid[])
          ORDER BY position ASC
          `,
          [listIds]
        );
        for (const it of itemsRes.rows) {
          const arr = itemsByList.get(it.list_id) ?? [];
          arr.push({ id: it.id, name: it.name, checked: it.is_checked, position: it.position });
          itemsByList.set(it.list_id, arr);
        }
      }

      const sharedUsernamesByList = new Map<string, string[]>();
      if (listIds.length) {
        const sharedRes = await db.query<{ list_id: string; username: string }>(
          `
          SELECT s.list_id, u.username
          FROM shopping_list_shares s
          JOIN users u ON u.id = s.shared_with_user_id
          WHERE s.list_id = ANY($1::uuid[])
          ORDER BY u.username ASC
          `,
          [listIds]
        );
        for (const row of sharedRes.rows) {
          const arr = sharedUsernamesByList.get(row.list_id) ?? [];
          arr.push(row.username);
          sharedUsernamesByList.set(row.list_id, arr);
        }
      }

      return listsRes.rows.map((l) => ({
        listId: l.list_id,
        name: l.name,
        orderForUser: l.order_for_user,
        isOwner: l.is_owner,
        ownerUsername: l.owner_username,
        isShared: l.is_shared,
        items: itemsByList.get(l.list_id) ?? [],
        sharedWith: sharedUsernamesByList.get(l.list_id) ?? [],
      }));
    });
  }

  // POST /shopping/lists
  static async createList(user: UserCtx, name: string, order?: number): Promise<ShoppingListDto> {
    const cleanName = String(name ?? "").trim();
    if (!cleanName) throw new Error("INVALID_NAME");

    return withTx(async (db) => {
      const pos = Number.isFinite(order) ? Math.max(0, Math.floor(order!)) : 0;

      const created = await db.query<{ id: string; name: string; position: number }>(
        `
        INSERT INTO shopping_lists (owner_user_id, name, position, is_shared)
        VALUES ($1, $2, $3, FALSE)
        RETURNING id, name, position
        `,
        [user.userId, cleanName, pos]
      );

      const row = created.rows[0];
      return {
        listId: row.id,
        name: row.name,
        orderForUser: row.position,
        isOwner: true,
        ownerUsername: user.username ?? "",
        isShared: false,
        items: [],
        sharedWith: [],
      };
    });
  }

  // GET /shopping/lists/:listId
  static async loadList(user: UserCtx, listId: string): Promise<ShoppingListDto> {
    return withTx(async (db) => {
      const listRes = await db.query<DbListRow>(
        `
        SELECT
          sl.id AS list_id,
          sl.name,
          CASE
            WHEN sl.owner_user_id = $1 THEN sl.position
            ELSE COALESCE(sh.position, sl.position)
          END AS order_for_user,
          (sl.owner_user_id = $1) AS is_owner,
          ou.username AS owner_username,
          (sl.is_shared OR EXISTS (
            SELECT 1 FROM shopping_list_shares s2 WHERE s2.list_id = sl.id
          )) AS is_shared
        FROM shopping_lists sl
        JOIN users ou ON ou.id = sl.owner_user_id
        LEFT JOIN shopping_list_shares sh
          ON sh.list_id = sl.id AND sh.shared_with_user_id = $1
        WHERE sl.id = $2 AND (sl.owner_user_id = $1 OR sh.shared_with_user_id = $1)
        LIMIT 1
        `,
        [user.userId, listId]
      );
      if (!listRes.rows.length) throw new Error("NOT_FOUND");

      const l = listRes.rows[0];

      const itemsRes = await db.query<DbItemRow>(
        `
        SELECT id, list_id, name, is_checked, position
        FROM shopping_list_items
        WHERE list_id = $1
        ORDER BY position ASC
        `,
        [listId]
      );

      const sharedRes = await db.query<{ username: string }>(
        `
        SELECT u.username
        FROM shopping_list_shares s
        JOIN users u ON u.id = s.shared_with_user_id
        WHERE s.list_id = $1
        ORDER BY u.username ASC
        `,
        [listId]
      );

      return {
        listId: l.list_id,
        name: l.name,
        orderForUser: l.order_for_user,
        isOwner: l.is_owner,
        ownerUsername: l.owner_username,
        isShared: l.is_shared,
        items: itemsRes.rows.map((it) => ({
          id: it.id,
          name: it.name,
          checked: it.is_checked,
          position: it.position,
        })),
        sharedWith: sharedRes.rows.map((r) => r.username),
      };
    });
  }

  // PUT /shopping/lists/:listId
  static async saveList(user: UserCtx, dto: ShoppingListDto): Promise<void> {
    const cleanName = String(dto.name ?? "").trim();
    if (!cleanName) throw new Error("INVALID_NAME");

    await withTx(async (db) => {
      // Verify user has access (owner or shared)
      const accessRes = await db.query<{ is_owner: boolean }>(
        `
        SELECT (owner_user_id = $1) AS is_owner
        FROM shopping_lists
        WHERE id = $2 AND (
          owner_user_id = $1 
          OR EXISTS (
            SELECT 1 FROM shopping_list_shares 
            WHERE list_id = $2 AND shared_with_user_id = $1
          )
        )
        `,
        [user.userId, dto.listId]
      );
      if (!accessRes.rows.length) throw new Error("NOT_FOUND_OR_FORBIDDEN");

      const isOwner = accessRes.rows[0].is_owner;

      // Update list name and position (only owner can change position)
      if (isOwner) {
        const pos = Number.isFinite(dto.orderForUser) ? Math.max(0, Math.floor(dto.orderForUser)) : 0;
        await db.query(
          `UPDATE shopping_lists SET name = $1, position = $2 WHERE id = $3`,
          [cleanName, pos, dto.listId]
        );
      } else {
        // Non-owner can only update name
        await db.query(
          `UPDATE shopping_lists SET name = $1 WHERE id = $2`,
          [cleanName, dto.listId]
        );
      }

      // Delete all existing items
      await db.query(
        `DELETE FROM shopping_list_items WHERE list_id = $1`,
        [dto.listId]
      );

      // Insert new items
      if (dto.items && dto.items.length > 0) {
        for (let i = 0; i < dto.items.length; i++) {
          const item = dto.items[i];
          // Only use client ID if it looks like a UUID (contains dashes)
          const itemId = item.id && item.id.includes('-') ? item.id : null;
          await db.query(
            `
            INSERT INTO shopping_list_items (id, list_id, name, is_checked, position)
            VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5)
            `,
            [itemId, dto.listId, item.name, item.checked, i]
          );
        }
      }
    });
  }

  // DELETE /shopping/lists/:listId (owner only)
  static async deleteList(user: UserCtx, listId: string): Promise<void> {
    await withTx(async (db) => {
      await db.query(
        `
        DELETE FROM shopping_lists
        WHERE id = $1 AND owner_user_id = $2
        `,
        [listId, user.userId]
      );
    });
  }

  // POST /shopping/lists/:listId/share
  static async shareList(user: UserCtx, listId: string, target: string): Promise<ShoppingListDto> {
    const identifier = String(target ?? "").trim();
    if (!identifier) throw new Error("INVALID_TARGET");

    return withTx(async (db) => {
      const userRes = await db.query<{ id: string }>(
        `SELECT id FROM users WHERE username = $1 LIMIT 1`,
        [identifier]
      );
      if (!userRes.rows.length) throw new Error("TARGET_NOT_FOUND");
      const targetUserId = userRes.rows[0].id;

      // Only owner can share
      const ownerRes = await db.query<{ is_owner: boolean }>(
        `
        SELECT (owner_user_id = $1) AS is_owner
        FROM shopping_lists WHERE id = $2
        `,
        [user.userId, listId]
      );
      if (!ownerRes.rows.length || !ownerRes.rows[0].is_owner) throw new Error("FORBIDDEN");

      // Insert the share
      await db.query(
        `
        INSERT INTO shopping_list_shares (list_id, shared_with_user_id, position)
        VALUES ($1, $2, 0)
        ON CONFLICT DO NOTHING
        `,
        [listId, targetUserId]
      );

      // Also update the is_shared flag
      await db.query(
        `UPDATE shopping_lists SET is_shared = TRUE WHERE id = $1`,
        [listId]
      );

      // Load the updated list directly in this transaction
      const listRes = await db.query<DbListRow>(
        `
        SELECT
          sl.id AS list_id,
          sl.name,
          sl.position AS order_for_user,
          (sl.owner_user_id = $1) AS is_owner,
          ou.username AS owner_username,
          TRUE AS is_shared
        FROM shopping_lists sl
        JOIN users ou ON ou.id = sl.owner_user_id
        WHERE sl.id = $2
        LIMIT 1
        `,
        [user.userId, listId]
      );
      if (!listRes.rows.length) throw new Error("NOT_FOUND");

      const l = listRes.rows[0];

      const itemsRes = await db.query<DbItemRow>(
        `
        SELECT id, list_id, name, is_checked, position
        FROM shopping_list_items
        WHERE list_id = $1
        ORDER BY position ASC
        `,
        [listId]
      );

      const sharedRes = await db.query<{ username: string }>(
        `
        SELECT u.username
        FROM shopping_list_shares s
        JOIN users u ON u.id = s.shared_with_user_id
        WHERE s.list_id = $1
        ORDER BY u.username ASC
        `,
        [listId]
      );

      return {
        listId: l.list_id,
        name: l.name,
        orderForUser: l.order_for_user,
        isOwner: l.is_owner,
        ownerUsername: l.owner_username,
        isShared: true,
        items: itemsRes.rows.map((it) => ({
          id: it.id,
          name: it.name,
          checked: it.is_checked,
          position: it.position,
        })),
        sharedWith: sharedRes.rows.map((r) => r.username),
      };
    });
  }

  // POST /shopping/lists/:listId/leave (non-owner)
  static async leaveList(user: UserCtx, listId: string): Promise<void> {
    await withTx(async (db) => {
      // Remove the user from shares
      await db.query(
        `
        DELETE FROM shopping_list_shares
        WHERE list_id = $1 AND shared_with_user_id = $2
        `,
        [listId, user.userId]
      );

      // Update is_shared flag if no more shares exist
      await db.query(
        `
        UPDATE shopping_lists
        SET is_shared = (
          EXISTS (SELECT 1 FROM shopping_list_shares WHERE list_id = $1)
        )
        WHERE id = $1
        `,
        [listId]
      );
    });
  }
}
