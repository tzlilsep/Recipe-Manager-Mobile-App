// Frontend/src/features/shoppingList/model/useShoppingListsController.ts
// All comments are in English only.

import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useShoppingLists } from './useShoppingLists';
import { ShoppingListData } from './domain/shopping.types';
import { sortByOrder, nextOrderFor, withNormalizedOrder } from './domain/listOrder';
import { readCache, writeCache } from './storage';
import { shoppingRepo } from '../api/shopping.repository';
import { useAuth } from '../../auth/model/auth.context';

/** In-memory snapshot per user for instant first render on re-entry. */
const inMemoryListsByUser: Record<string, ShoppingListData[]> = {};

export function useShoppingListsController(initial: ShoppingListData[] = []) {
  const { auth } = useAuth();
  const userId = auth?.userId ?? null;
  const repo = shoppingRepo({ token: auth?.token });

  // A ref that marks when we are applying external data (cache/remote) to state.
  // While this flag is true, onPersist will skip server saves (saveMany).
  const isApplyingExternalUpdateRef = useRef<boolean>(false);

  // Resolve a synchronous initial snapshot for the current user.
  // This runs before the first render and seeds the hook with data immediately.
  const initialSnapshot: ShoppingListData[] =
    (userId && inMemoryListsByUser[userId]) ? inMemoryListsByUser[userId] : initial;

  const {
    lists, setLists,
    selectedListId, setSelectedListId,
    currentList, addList, renameList,
    addItem, deleteItem, toggleItem, clearCompleted,
  } = useShoppingLists(initialSnapshot, async (l) => {
    // Always persist cache for the current user.
    await writeCache(userId, l);

    // Skip server save when we are applying cache/remote data.
    if (isApplyingExternalUpdateRef.current) return;

    try {
      await repo.saveMany(l as any);
    } catch (e) {
      console.warn('saveMany failed', e);
    }
  });

  // If we started with a snapshot, we can be ready immediately (no blank frame).
  const [isReady, setIsReady] = useState<boolean>(initialSnapshot.length > 0);

  // Used by the list screen to suppress empty state while fetching from server.
  const [isSyncingRemote, setIsSyncingRemote] = useState<boolean>(false);

  // Track previous user id to detect account switches.
  const prevUserIdRef = useRef<string | null>(userId);

  // --- helpers ---
  const removeLocally = (id: number) => {
    setLists(prev => prev.filter(l => l.id !== id));
    if (selectedListId === id) setSelectedListId(null);
  };

  /**
   * Hydrate from per-user cache with SWR semantics.
   * - If user changed → clear state, then hydrate new user's cache, then ready.
   * - If same user → do NOT clear; update from cache if found; ready afterwards.
   */
  const hydrateFromCache = (userChanged: boolean) => {
    let mounted = true;

    if (!userId) {
      // Logged-out: clear and mark ready immediately.
      setLists([]);
      setSelectedListId(null);
      setIsReady(true);
      return () => { /* no-op */ };
    }

    if (userChanged) {
      // Switching accounts: clear UI immediately to avoid leaking previous user's data.
      setLists([]);
      setSelectedListId(null);
      setIsReady(false);
    } else {
      // Same user: we already seeded lists synchronously via initialSnapshot above.
      // Keep isReady as-is; if no snapshot existed, it is false until cache returns.
    }

    (async () => {
      try {
        const cached = await readCache(userId);
        if (!mounted) return;

        // Mark external apply so onPersist will not save to server.
        isApplyingExternalUpdateRef.current = true;

        if (cached && Array.isArray(cached)) {
          const sorted = sortByOrder(cached);
          setLists(sorted);
          inMemoryListsByUser[userId] = sorted; // keep memory fresh
        } else if (userChanged) {
          setLists([]);
          inMemoryListsByUser[userId] = [];
        }
      } finally {
        // External apply is done; normal user-initiated mutations will save again.
        isApplyingExternalUpdateRef.current = false;
        if (mounted) setIsReady(true);
      }
    })();

    return () => { mounted = false; };
  };

  /**
   * Background remote refresh (revalidate).
   * Always writes fresh lists to state and updates both in-memory snapshot and cache.
   * The service already normalizes sharing fields; we keep sorting here defensively.
   */
  const syncFromRemote = () => {
    let mounted = true;

    if (!auth?.token || !userId) {
      setIsSyncingRemote(false);
      return () => { /* no-op */ };
    }

    (async () => {
      setIsSyncingRemote(true);
      try {
        const remote = await repo.fetchLists(20);
        if (!mounted) return;

        const sorted = sortByOrder(remote);

        // Mark external apply so onPersist will not save to server.
        isApplyingExternalUpdateRef.current = true;

        setLists(sorted);

        // Keep in-memory fresh (sorted) and persist cache for next cold start.
        inMemoryListsByUser[userId] = sorted;
        try {
          await writeCache(userId, sorted);
        } catch (e) {
          console.warn('writeCache after fetch failed', e);
        }
      } catch (e) {
        console.warn('remote fetch failed', e);
      } finally {
        // External apply is done.
        isApplyingExternalUpdateRef.current = false;
        if (mounted) setIsSyncingRemote(false);
      }
    })();

    return () => { mounted = false; };
  };

  // Detect account switch and hydrate accordingly.
  useEffect(() => {
    const userChanged = prevUserIdRef.current !== userId;
    prevUserIdRef.current = userId;
    return hydrateFromCache(userChanged);
  }, [userId]);

  // Keep in-memory snapshot up-to-date for instant future mounts.
  useEffect(() => {
    if (userId) {
      inMemoryListsByUser[userId] = lists;
    }
  }, [userId, lists]);

  // Background server refresh.
  useEffect(syncFromRemote, [auth?.token, userId]);

  // actions
  const createList = async (name: string) => {
    const finalName = name?.trim() || 'רשימה חדשה';
    const order = nextOrderFor(lists);
    try {
      const created = await repo.create(finalName, Date.now(), order);
      const next = sortByOrder([...lists, created]);
      setLists(next);
      if (userId) inMemoryListsByUser[userId] = next;
    } catch (e) {
      console.warn('Create failed', e);
    }
  };

  const deleteListSmart = async (id: number) => {
    const list = lists.find(l => l.id === id);
    removeLocally(id);
    try {
      if (list) await repo.deleteOrLeave(list);
    } catch (e) {
      console.warn('delete/leave failed', e);
    }
  };

  const leaveList = async (id: number) => {
    removeLocally(id);
    try {
      await repo.leave(id);
    } catch (e) {
      console.warn('leave failed', e);
    }
  };

  const reorder = async (next: ShoppingListData[]) => {
    const sorted = sortByOrder(withNormalizedOrder(next));
    setLists(sorted);
    if (userId) inMemoryListsByUser[userId] = sorted;
  };

  /**
   * Share a list with a target identifier (username).
   * We merge the updated list from the repo into the current state,
   * keep in-memory snapshot fresh, and persist cache for future cold starts.
   */
  const share = async (id: number, identifier: string) => {
    if (!auth?.token) return Alert.alert('שיתוף רשימה', 'לא ניתן לשתף ללא התחברות.');
    if ((identifier || '').trim() === userId) return Alert.alert('שיתוף רשימה', 'אי אפשר לשתף רשימה עם עצמך.');
    try {
      console.log('Before share - current lists:', lists.map(l => ({ id: l.id, name: l.name, isShared: l.isShared, sharedWith: l.sharedWith })));
      
      const updated = await repo.share(id, identifier);
      
      console.log('Share result:', { 
        originalId: id, 
        updatedId: updated.id, 
        updatedSharedWith: updated.sharedWith,
        updatedIsShared: updated.isShared 
      });
      
      // Mark as external update to prevent saving back to server
      isApplyingExternalUpdateRef.current = true;
      
      // Force update by creating new array and new objects
      const next = lists.map(l => {
        if (l.id === updated.id) {
          console.log('Found matching list, replacing with:', { id: updated.id, isShared: updated.isShared, sharedWith: updated.sharedWith });
          return { ...updated };
        }
        return l;
      });
      
      console.log('After map - next array:', next.map(l => ({ id: l.id, name: l.name, isShared: l.isShared, sharedWith: l.sharedWith })));
      
      const sorted = sortByOrder(next);
      console.log('After sort:', sorted.map(l => ({ id: l.id, name: l.name, isShared: l.isShared, sharedWith: l.sharedWith })));
      
      setLists(sorted);

      if (userId) {
        inMemoryListsByUser[userId] = sorted;
        // Persist cache explicitly as a guard (persist also happens via onPersist effect).
        try {
          await writeCache(userId, sorted);
        } catch (e) {
          console.warn('writeCache after share failed', e);
        }
      }

      // Reset the flag after state update
      isApplyingExternalUpdateRef.current = false;

      Alert.alert('שיתוף רשימה', 'השיתוף בוצע בהצלחה.');
    } catch (e: any) {
      isApplyingExternalUpdateRef.current = false;
      Alert.alert('שיתוף נכשל', (e?.message || '').trim() || 'שגיאה בעת שיתוף הרשימה');
    }
  };

  const saveName = async (name: string) => {
    if (!currentList) return;
    renameList(currentList.id, name);
    try {
      await repo.saveName(currentList, name);
    } catch (e) {
      console.warn('save name failed', e);
    }
  };

  return {
    // state
    lists, selectedListId, currentList, isReady, isSyncingRemote,

    // navigation
    openList: (id: number) => setSelectedListId(id),
    closeList: () => setSelectedListId(null),

    // list operations
    createList, deleteListSmart, leaveList, reorder, share, saveName,

    // item operations (operate on currentList)
    addItem: (name: string) => currentList && addItem(currentList.id, name),
    toggleItem: (itemId: number) => currentList && toggleItem(currentList.id, itemId),
    deleteItem: (itemId: number) => currentList && deleteItem(currentList.id, itemId),
    clearCompleted: () => currentList && clearCompleted(currentList.id),
  };
}
