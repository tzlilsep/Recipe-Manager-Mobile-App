import React, { useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingListData } from '../model/shopping.types';
import { useShoppingLists } from '../model/useShoppingLists';
import { ShoppingListsScreen } from './screens/ShoppingListsScreen';
import { ShoppingListDetailsScreen } from './screens/ShoppingListDetailsScreen';
import { useAuth } from '../../auth/model/auth.context';
import { shoppingService } from '../api/shopping.service';

type Props = {
  onBack: () => void;
  initialLists?: ShoppingListData[];
};

const CACHE_KEY = 'shopping/lists:v1';

export function ShoppingListScreen({ onBack, initialLists = [] }: Props) {
  const {
    lists,
    setLists,
    selectedListId,
    setSelectedListId,
    currentList,
    addList,
    /* deleteList,  <-- מוסר: לא משתמשים כדי לא לשנות order */
    renameList,
    addItem,
    deleteItem,
    toggleItem,
    clearCompleted,
  } = useShoppingLists(
  initialLists,
  async (listsToPersist) => {
    // אם אין טוקן – רק קאש מקומי
    if (!auth?.token) {
      try {
        const sorted = sortByOrder(listsToPersist as any);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
      } catch {}
      return;
    }

    // יש טוקן – שומרות לענן וגם מעדכנות קאש
    try {
      await shoppingService.saveMany(auth.token, listsToPersist);
      const sorted = sortByOrder(listsToPersist as any);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
    } catch (e) {
      console.warn('Failed to persist lists to server:', e);
    }
  }
);

  const { auth } = useAuth();
  const insets = useSafeAreaInsets();
  const safeTop = insets.top && insets.top > 0 ? insets.top : 44;

  /** Utility: always return a list sorted by `order` (fallback to index). */
  const sortByOrder = (arr: ShoppingListData[]) =>
    [...arr].sort((a: any, b: any) => {
      const ao = a.order ?? Number.MAX_SAFE_INTEGER;
      const bo = b.order ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      // tie-breaker: keep stable by id to avoid jitter
      return String(a.id).localeCompare(String(b.id));
    });

  /**
   * Create-list handler:
   * - Assigns incremental `order` so the new list appears at the bottom.
   * - If token exists: creates on server with that `order`, else local.
   * - Writes to cache.
   */
  const handleCreateList = async (name: string) => {
    const finalName = name?.trim() || 'רשימה חדשה';

    const appendWithOrder = (base: ShoppingListData[], newList: ShoppingListData) => {
      const nextOrder =
        base.length === 0 ? 0 : Math.max(...base.map(l => (l as any).order ?? -1)) + 1;
      const withOrder = { ...(newList as any), order: nextOrder } as any;
      const next = sortByOrder([...base, withOrder]);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    };

    if (!auth.token) {
      // Local only
      setLists(prev => appendWithOrder(prev, { id: Date.now(), name: finalName, items: [] } as any));
      return;
    }

    try {
      // <<< שולחים order לשרת כבר ביצירה
      const current = lists;
      const nextOrder =
        current.length === 0 ? 0 : Math.max(...current.map(l => (l as any).order ?? -1)) + 1;
      const created = await shoppingService.createList(auth.token, finalName, Date.now(), nextOrder);

      setLists(prev => {
        const next = sortByOrder([...prev, created]);
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    } catch (e) {
      console.warn('Create list failed, falling back to local:', e);
      setLists(prev => appendWithOrder(prev, { id: Date.now(), name: finalName, items: [] } as any));
    }
  };

  /**
   * ✅ Delete-list handler (ענן + לוקאלי) — לא נוגעים ב-order של אחרות.
   * - אופטימי: מסיר מה־state ומעדכן Cache.
   * - אם יש token: שולח DELETE לשרת.
   */
  const handleDeleteList = async (id: number) => {
    // אופטימי: הסרה מקומית ושמירת קאש (בלי רה-אינדוקס order)
    setLists(prev => {
      const next = prev.filter(l => l.id !== id);
      const sorted = sortByOrder(next); // רק סידור לפי order קיים; לא משנים ערכים
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sorted)).catch(() => {});
      return sorted;
    });

    if (selectedListId === id) setSelectedListId(null);

    if (auth.token) {
      try {
        await shoppingService.deleteList(auth.token, id); // מחיקה בענן
      } catch (e) {
        console.warn('Failed to delete on server:', e);
        // אופציונלי: לשקול Rollback/טוסט; לפי בקשתך נשאיר פשוט.
      }
    }
  };

  /**
   * Persist reordering from DraggableFlatList:
   * - Normalize `order` to match visual index and persist to cache.
   * - If authenticated: also persist to server (optimistic).
   */
  const handleReorder = async (nextLists: ShoppingListData[]) => {
    const normalized = nextLists.map((l, idx) => ({ ...(l as any), order: idx })) as any[];
    const sorted = sortByOrder(normalized);

    setLists(sorted);
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sorted)).catch(() => {});

    if (auth.token) {
      try {
        await shoppingService.saveMany(auth.token, sorted);
      } catch (e) {
        console.warn('Failed to persist reorder to server:', e);
      }
    }
  };

  /** 1) Hydration from local cache. */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (!isMounted) return;
        if (raw) {
          const cached: ShoppingListData[] = JSON.parse(raw);
          if (Array.isArray(cached)) {
            setLists(sortByOrder(cached as any));
          }
        }
      } catch {
        // ignore cache errors
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [setLists]);

  /**
   * 2) Remote fetch when authenticated: merge and respect server `order` if present.
   */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!auth.token) return;
      try {
        const remote = await shoppingService.getLists(auth.token, 20);
        if (!isMounted) return;

        setLists(prev => {
          const orderMap = new Map(prev.map(l => [l.id, (l as any).order]));
          const merged = remote.map((l, idx) => ({
            ...l,
            order: orderMap.get(l.id) ?? l.order ?? idx,
          })) as any[];
          const sorted = sortByOrder(merged);
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sorted)).catch(() => {});
          return sorted;
        });
      } catch (e) {
        console.warn('Failed loading shopping lists:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [auth.token, setLists]);

  // Details branch
  if (selectedListId !== null && currentList) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ShoppingListDetailsScreen
          safeTop={safeTop}
          list={currentList}
          onBack={() => setSelectedListId(null)}
          onRename={async (name) => {
            renameList(currentList.id, name); // לוקאלי מידי
            if (auth.token) {
              try {
                await shoppingService.saveList(auth.token, { ...currentList, name });
              } catch (e) {
                console.warn('שמירת שם רשימה נכשלה:', e);
              }
            }
          }}
          onAddItem={(name) => addItem(currentList.id, name)}
          onToggleItem={(itemId) => toggleItem(currentList.id, itemId)}
          onDeleteItem={(itemId) => deleteItem(currentList.id, itemId)}
          onClearCompleted={() => clearCompleted(currentList.id)}
        />
      </SafeAreaView>
    );
  }

  // Lists branch
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ShoppingListsScreen
        safeTop={safeTop}
        lists={lists}                // already sorted by order
        onBack={onBack}
        onCreateList={handleCreateList}
        onOpenList={(id) => setSelectedListId(id)}
        onDeleteList={handleDeleteList}   // <<< עכשיו מוחק בענן בלי לשנות order
        onReorder={handleReorder}         // שמירת סדר בענן כשגוררים
      />
    </SafeAreaView>
  );
}
