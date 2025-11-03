// src/features/shoppingList/model/useShoppingLists.ts
import { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingListData } from './shopping.types';

type PersistFn = (lists: ShoppingListData[]) => void;
type DeleteFn = (deletedId: number, remaining: ShoppingListData[]) => void;

export function useShoppingLists(
  initial: ShoppingListData[] = [],
  onPersist?: PersistFn,                // לשמירת רשימות/סדר
  onDelete?: DeleteFn,                  // חדש: מחיקה בענן
) {
  const [lists, setLists] = useState<ShoppingListData[]>(
    [...initial].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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
      return [...prev, { id: Date.now(), name, items: [], order: nextOrder }];
    });
  };

  const deleteList = (listId: number) => {
    setLists(prev => {
      const filtered = prev.filter(l => l.id !== listId);
      const reindexed = filtered
        .sort((a, b) => a.order - b.order)
        .map((l, idx) => ({ ...l, order: idx }));
      // קריאה למחיקה בענן (DELETE) + אפשרות להשתמש ב-remaining ל-saveMany לסדר החדש
      onDelete?.(listId, reindexed);
      return reindexed;
    });
    if (selectedListId === listId) setSelectedListId(null);
  };

  const renameList = (listId: number, name: string) => {
    if (!name.trim()) return;
    setLists(prev => prev.map(l => (l.id === listId ? { ...l, name } : l)));
    // שימי לב: אין צורך לקרוא כאן onPersist ידנית — useEffect כבר יעשה את זה
  };

  // --- פריטים ---
  const addItem = (listId: number, name: string) => {
    if (!name.trim()) return;
    setLists(prev =>
      prev.map(l =>
        l.id === listId
          ? { ...l, items: [...l.items, { id: Date.now(), name, checked: false }] }
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

  const reorderLists = (sourceIndex: number, destIndex: number) => {
    if (sourceIndex === destIndex) return;
    setLists(prev => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const [moved] = arr.splice(sourceIndex, 1);
      arr.splice(destIndex, 0, moved);
      return arr.map((l, idx) => ({ ...l, order: idx }));
    });
  };

  const moveListBefore = (movedId: number, beforeId: number | null) => {
    setLists(prev => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const from = arr.findIndex(l => l.id === movedId);
      if (from < 0) return prev;
      const [moved] = arr.splice(from, 1);
      const to = beforeId === null ? arr.length : arr.findIndex(l => l.id === beforeId);
      const insertAt = to < 0 ? arr.length : to;
      arr.splice(insertAt, 0, moved);
      return arr.map((l, idx) => ({ ...l, order: idx }));
    });
  };

  const orderedLists = useMemo(
    () => [...lists].sort((a, b) => a.order - b.order),
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
    reorderLists,
    moveListBefore,
  };
}
