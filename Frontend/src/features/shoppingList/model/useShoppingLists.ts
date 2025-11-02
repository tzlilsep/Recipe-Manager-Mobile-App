// src/features/shoppingList/model/useShoppingLists.ts
import { useState, useMemo } from 'react';
import { ShoppingListData } from './shopping.types';

export function useShoppingLists(initial: ShoppingListData[] = []) {
  const [lists, setLists] = useState<ShoppingListData[]>(initial);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

  const currentList = useMemo(
    () => lists.find(l => l.id === selectedListId) ?? null,
    [lists, selectedListId]
  );

  // פעולות ברמת רשימות
  const addList = (name: string) => {
    if (!name.trim()) return;
    setLists(prev => [...prev, { id: Date.now(), name, items: [] }]);
  };

  const deleteList = (listId: number) => {
    setLists(prev => prev.filter(l => l.id !== listId));
    if (selectedListId === listId) setSelectedListId(null);
  };

  const renameList = (listId: number, name: string) => {
    if (!name.trim()) return;
    setLists(prev => prev.map(l => (l.id === listId ? { ...l, name } : l)));
  };

  // פעולות ברמת פריטים
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

  return {
    lists,
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
  };
}
