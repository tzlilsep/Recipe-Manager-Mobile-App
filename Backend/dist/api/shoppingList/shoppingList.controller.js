"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shoppingListController = void 0;
const shoppingList_validators_1 = require("./shoppingList.validators");
const shoppingList_service_1 = require("../../engine/shoppingList/shoppingList.service");
function toUserCtx(req) {
    return { userId: req.user.userId, username: req.user.username };
}
function mapError(e) {
    const msg = (e instanceof Error ? e.message : String(e)) || 'UNKNOWN';
    const code = msg;
    if (code === 'NOT_FOUND')
        return { status: 404, code };
    if (code === 'FORBIDDEN' || code === 'NOT_FOUND_OR_FORBIDDEN')
        return { status: 403, code };
    if (code === 'INVALID_NAME' || code === 'INVALID_TARGET')
        return { status: 400, code };
    if (code === 'ALREADY_SHARED')
        return { status: 409, code };
    return { status: 400, code };
}
exports.shoppingListController = {
    async getLists(req, res) {
        try {
            const take = (0, shoppingList_validators_1.asInt)(req.query.take, 20);
            const lists = await shoppingList_service_1.ShoppingListService.getLists(toUserCtx(req), take);
            res.json({ lists });
        }
        catch (e) {
            const m = mapError(e);
            res.status(m.status).json({ lists: [] });
        }
    },
    async createList(req, res) {
        try {
            const name = (0, shoppingList_validators_1.asNonEmptyString)(req.body?.name, 'INVALID_NAME');
            const order = req.body?.order != null ? (0, shoppingList_validators_1.asInt)(req.body.order, 0) : undefined;
            const list = await shoppingList_service_1.ShoppingListService.createList(toUserCtx(req), name, order);
            res.json({ ok: true, list });
        }
        catch (e) {
            const m = mapError(e);
            res.status(m.status).json({ ok: false, error: m.code });
        }
    },
    async loadList(req, res) {
        try {
            const listId = (0, shoppingList_validators_1.asNonEmptyString)(req.params.listId, 'INVALID_LIST_ID');
            const list = await shoppingList_service_1.ShoppingListService.loadList(toUserCtx(req), listId);
            res.json(list);
        }
        catch (e) {
            const m = mapError(e);
            res.status(m.status).json({ ok: false, error: m.code });
        }
    },
    async saveList(req, res) {
        try {
            const listId = (0, shoppingList_validators_1.asNonEmptyString)(req.params.listId, 'INVALID_LIST_ID');
            const dto = req.body?.list;
            if (!dto || dto.listId !== listId)
                throw new Error('INVALID_PAYLOAD');
            await shoppingList_service_1.ShoppingListService.saveList(toUserCtx(req), dto);
            res.json({ ok: true });
        }
        catch (e) {
            const m = mapError(e);
            res.status(m.status).json({ ok: false, error: m.code });
        }
    },
    async deleteList(req, res) {
        try {
            const listId = (0, shoppingList_validators_1.asNonEmptyString)(req.params.listId, 'INVALID_LIST_ID');
            await shoppingList_service_1.ShoppingListService.deleteList(toUserCtx(req), listId);
            res.status(204).send();
        }
        catch (e) {
            const m = mapError(e);
            res.status(m.status).json({ ok: false, error: m.code });
        }
    },
    async shareList(req, res) {
        try {
            const listId = (0, shoppingList_validators_1.asNonEmptyString)(req.params.listId, 'INVALID_LIST_ID');
            const target = (0, shoppingList_validators_1.asNonEmptyString)(req.body?.target, 'INVALID_TARGET');
            const list = await shoppingList_service_1.ShoppingListService.shareList(toUserCtx(req), listId, target);
            res.json({ ok: true, list });
        }
        catch (e) {
            const m = mapError(e);
            res.status(m.status).json({ ok: false, error: m.code });
        }
    },
    async leaveList(req, res) {
        try {
            const listId = (0, shoppingList_validators_1.asNonEmptyString)(req.params.listId, 'INVALID_LIST_ID');
            await shoppingList_service_1.ShoppingListService.leaveList(toUserCtx(req), listId);
            res.json({ ok: true, listId });
        }
        catch (e) {
            const m = mapError(e);
            res.status(m.status).json({ ok: false, listId: req.params.listId, error: m.code });
        }
    },
};
