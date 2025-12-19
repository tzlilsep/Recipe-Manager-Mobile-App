// Frontend\src\features\shoppingList\model\useShoppingLists.ts
import { useState, useMemo, useEffect } from 'react';
import { ShoppingListData } from './domain/shopping.types';

type PersistFn = (lists: ShoppingListData[]) => void;
type DeleteFn = (deletedId: number, remaining: ShoppingListData[]) => void;

// כולל isOwner כדי לאפשר עדכון מטא מלא כשצריך
type ShareMetaPatch = Partial<
  Pick<ShoppingListData, 'isShared' | 'sharedWith' | 'shareStatus' | 'isOwner'>
>;

/** נרמול שיתוף לשותף יחיד + סנכרון isShared */
function normalizeShareMeta<T extends Partial<ShoppingListData>>(l: T): T {
  const clone: any = { ...l };

  if ('sharedWith' in clone && Array.isArray(clone.sharedWith)) {
    // שומרים רק 0..1 שותף
    clone.sharedWith = clone.sharedWith.slice(0, 1);
  }

  if ('sharedWith' in clone) {
    const count = Array.isArray(clone.sharedWith) ? clone.sharedWith.length : 0;
    // אם isShared לא נשלח מפורשות — קובע לפי sharedWith
    if (!('isShared' in clone)) {
      clone.isShared = count > 0;
    } else {
      // אם הגיע isShared מפורשות, תן לו עדיפות—אבל נוודא קונסיסטנטיות
      if (clone.isShared && count === 0) {
        // אין שותף אבל מסומן isShared=true → תהפוך ל-false כדי למנוע מצב לא עקבי
        clone.isShared = false;
      }
    }
  }

  return clone;
}

export function useShoppingLists(
  initial: ShoppingListData[] = [],
  onPersist?: PersistFn, // לשמירת רשימות/סדר
  onDelete?: DeleteFn,   // מחיקה בענן (או leave לפי ה־Container)
) {
  // Defensive: assign order to any list missing it (e.g. shared lists from server)
  // Shared lists (isShared && !isOwner) always get order at the end
  // Always re-index orders so shared lists are last, regardless of incoming order
  const initialWithOrder = (() => {
    const owners = initial.filter(l => !l.isShared || l.isOwner);
    const shared = initial.filter(l => l.isShared && !l.isOwner);
    const ownersWithOrder = owners.map((l, idx) => ({ ...l, order: idx }));
    const sharedWithOrder = shared.map((l, idx) => ({ ...l, order: ownersWithOrder.length + idx }));
    return [...ownersWithOrder, ...sharedWithOrder];
  })();
  const [lists, setLists] = useState<ShoppingListData[]>(
    initialWithOrder.sort((a, b) => ((a.order ?? 0) - (b.order ?? 0)))
  );
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

  // התמדה כללית של שינויים (rename / reorder / add / items וכו')
  useEffect(() => {
    onPersist?.(lists);
  }, [lists, onPersist]);

  const currentList = useMemo(
    () => lists.find(l => l.id === selectedListId) ?? null,
    [lists, selectedListId]
  );

  const addList = (name: string) => {
    if (!name.trim()) return;
    setLists(prev => {
      const nextOrder =
        prev.length === 0 ? 0 : Math.max(...prev.map(l => l.order ?? -1)) + 1;
      // יוצר מקומי: סביר להניח שהוא הבעלים
      return [
        ...prev,
        { id: Date.now(), name, items: [], order: nextOrder, isOwner: true, isShared: false, sharedWith: [] },
      ];
    });
  };

  const deleteList = (listId: number) => {
    setLists(prev => {
      const filtered = prev.filter(l => l.id !== listId);
      const reindexed = filtered
        .sort((a, b) => ((a.order ?? 0) - (b.order ?? 0)))
        .map((l, idx) => ({ ...l, order: idx }));
      onDelete?.(listId, reindexed);
      return reindexed;
    });
    if (selectedListId === listId) setSelectedListId(null);
  };

  const renameList = (listId: number, name: string) => {
    if (!name.trim()) return;
    setLists(prev => prev.map(l => (l.id === listId ? { ...l, name } : l)));
  };

  // --- פריטים ---
  const addItem = (listId: number, name: string) => {
    if (!name.trim()) return;
    // Generate a simple unique ID (timestamp + random)
    const uniqueId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    setLists(prev =>
      prev.map(l =>
        l.id === listId
          ? { ...l, items: [...l.items, { id: uniqueId, name, checked: false }] }
          : l
      )
    );
  };

  const deleteItem = (listId: number, itemId: number) => {
    setLists(prev =>
      prev.map(l =>
        l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l
      )
    );
  };

  const toggleItem = (listId: number, itemId: number) => {
    setLists(prev =>
      prev.map(l =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map(i => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
            }
          : l
      )
    );
  };

  const clearCompleted = (listId: number) => {
    setLists(prev =>
      prev.map(l =>
        l.id === listId ? { ...l, items: l.items.filter(i => !i.checked) } : l
      )
    );
  };

  const reorderItems = (listId: number, newOrder: any[]) => {
    setLists(prev =>
      prev.map(l =>
        l.id === listId ? { ...l, items: newOrder } : l
      )
    );
  };

  const reorderLists = (sourceIndex: number, destIndex: number) => {
    if (sourceIndex === destIndex) return;
    setLists(prev => {
      const arr = [...prev].sort((a, b) => ((a.order ?? 0) - (b.order ?? 0)));
      const [moved] = arr.splice(sourceIndex, 1);
      arr.splice(destIndex, 0, moved);
      return arr.map((l, idx) => ({ ...l, order: idx }));
    });
  };

  const moveListBefore = (movedId: number, beforeId: number | null) => {
    setLists(prev => {
      const arr = [...prev].sort((a, b) => ((a.order ?? 0) - (b.order ?? 0)));
      const from = arr.findIndex(l => l.id === movedId);
      if (from < 0) return prev;
      const [moved] = arr.splice(from, 1);
      const to = beforeId === null ? arr.length : arr.findIndex(l => l.id === beforeId);
      const insertAt = to < 0 ? arr.length : to;
      arr.splice(insertAt, 0, moved);
      return arr.map((l, idx) => ({ ...l, order: idx }));
    });
  };

  // --- 🔗 עזרה לשיתוף (Frontend <-> API) ---
  /** מחליף רשימה מעודכנת מהשרת (כולל שדות השיתוף) עם נרמול 0..1 שותף */
  const replaceList = (updated: ShoppingListData) => {
    const normalized = normalizeShareMeta(updated);
    setLists(prev => {
      if (prev.some(l => l.id === normalized.id)) {
        // Update existing list
        return prev.map(l => (l.id === normalized.id ? { ...l, ...normalized } : l));
      } else {
        // Always add new shared list at the end, ignore incoming order
        let usedOrders = new Set(prev.map(l => l.order ?? -1));
        let nextOrder = prev.length === 0 ? 0 : Math.max(...Array.from(usedOrders)) + 1;
        while (usedOrders.has(nextOrder)) nextOrder++;
        return [...prev, { ...normalized, order: nextOrder }];
      }
    });
  };

  /** עדכון מטא־דאטה לשיתוף מקומית (למשל אופטימיות "pending") – עם נרמול 0..1 */
  const updateShareMeta = (listId: number, meta: ShareMetaPatch) => {
    const normalized = normalizeShareMeta(meta);
    setLists(prev => prev.map(l => (l.id === listId ? { ...l, ...normalized } : l)));
  };

  /** עזרת אופטימיות: סימון משותפת מקומית לשותף יחיד */
  const markSharedLocal = (listId: number, partnerIdentifier: string, status: 'pending' | 'active' = 'active') => {
    updateShareMeta(listId, { sharedWith: [partnerIdentifier], shareStatus: status, isShared: true });
  };

  /** עזרת אופטימיות: ניקוי שיתוף מקומי (למשל אחרי leave) */
  const clearShareLocal = (listId: number) => {
    updateShareMeta(listId, { sharedWith: [], isShared: false, shareStatus: undefined });
  };

  const orderedLists = useMemo(
    () => [...lists].sort((a, b) => ((a.order ?? 0) - (b.order ?? 0))),
    [lists]
  );

  return {
    lists: orderedLists,
    setLists,
    selectedListId,
    setSelectedListId,
    currentList,
    addList,
    deleteList,
    renameList,
    addItem,
    deleteItem,
    toggleItem,
    clearCompleted,
    reorderItems,
    reorderLists,
    moveListBefore,

    // שיתוף
    replaceList,
    updateShareMeta,
    markSharedLocal,
    clearShareLocal,
  };
}
