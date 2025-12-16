import type { Response, RequestHandler } from 'express';
import type { AuthedRequest } from './shoppingList.types';
import { asInt, asNonEmptyString } from './shoppingList.validators';
import { ShoppingListService } from '../../engine/shoppingList/shoppingList.service';

function toUserCtx(req: AuthedRequest) {
  return { userId: req.user.userId, username: req.user.username };
}

function mapError(e: unknown): { status: number; code: string } {
  const msg = (e instanceof Error ? e.message : String(e)) || 'UNKNOWN';
  const code = msg;

  if (code === 'NOT_FOUND') return { status: 404, code };
  if (code === 'FORBIDDEN' || code === 'NOT_FOUND_OR_FORBIDDEN') return { status: 403, code };
  if (code === 'INVALID_NAME' || code === 'INVALID_TARGET') return { status: 400, code };
  if (code === 'ALREADY_SHARED') return { status: 409, code };

  return { status: 400, code };
}

export const shoppingListController = {
  getLists: (async (req: AuthedRequest, res: Response) => {
    try {
      const take = asInt(req.query.take, 20);
      const lists = await ShoppingListService.getLists(toUserCtx(req), take);
      res.json({ lists });
    } catch (e) {
      const m = mapError(e);
      res.status(m.status).json({ lists: [] });
    }
  }) as unknown as RequestHandler,

  createList: (async (req: AuthedRequest, res: Response) => {
    try {
      const name = asNonEmptyString(req.body?.name, 'INVALID_NAME');
      const order = req.body?.order != null ? asInt(req.body.order, 0) : undefined;
      const list = await ShoppingListService.createList(toUserCtx(req), name, order);
      res.json({ ok: true, list });
    } catch (e) {
      const m = mapError(e);
      res.status(m.status).json({ ok: false, error: m.code });
    }
  }) as unknown as RequestHandler,

  loadList: (async (req: AuthedRequest, res: Response) => {
    try {
      const listId = asNonEmptyString(req.params.listId, 'INVALID_LIST_ID');
      const list = await ShoppingListService.loadList(toUserCtx(req), listId);
      res.json(list);
    } catch (e) {
      const m = mapError(e);
      res.status(m.status).json({ ok: false, error: m.code });
    }
  }) as unknown as RequestHandler,

  saveList: (async (req: AuthedRequest, res: Response) => {
    try {
      const listId = asNonEmptyString(req.params.listId, 'INVALID_LIST_ID');
      const dto = req.body?.list;
      if (!dto || dto.listId !== listId) throw new Error('INVALID_PAYLOAD');

      await ShoppingListService.saveList(toUserCtx(req), dto);
      res.json({ ok: true });
    } catch (e) {
      const m = mapError(e);
      res.status(m.status).json({ ok: false, error: m.code });
    }
  }) as unknown as RequestHandler,

  deleteList: (async (req: AuthedRequest, res: Response) => {
    try {
      const listId = asNonEmptyString(req.params.listId, 'INVALID_LIST_ID');
      await ShoppingListService.deleteList(toUserCtx(req), listId);
      res.status(204).send();
    } catch (e) {
      const m = mapError(e);
      res.status(m.status).json({ ok: false, error: m.code });
    }
  }) as unknown as RequestHandler,

  shareList: (async (req: AuthedRequest, res: Response) => {
    try {
      const listId = asNonEmptyString(req.params.listId, 'INVALID_LIST_ID');
      const target = asNonEmptyString(req.body?.target, 'INVALID_TARGET');
      const list = await ShoppingListService.shareList(toUserCtx(req), listId, target);
      res.json({ ok: true, list });
    } catch (e) {
      const m = mapError(e);
      res.status(m.status).json({ ok: false, error: m.code });
    }
  }) as unknown as RequestHandler,

  leaveList: (async (req: AuthedRequest, res: Response) => {
    try {
      const listId = asNonEmptyString(req.params.listId, 'INVALID_LIST_ID');
      await ShoppingListService.leaveList(toUserCtx(req), listId);
      res.json({ ok: true, listId });
    } catch (e) {
      const m = mapError(e);
      res.status(m.status).json({ ok: false, listId: req.params.listId, error: m.code });
    }
  }) as unknown as RequestHandler,
};
