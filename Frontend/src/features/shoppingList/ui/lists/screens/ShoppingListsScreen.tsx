// Frontend/src/features/shoppingList/ui/lists/screens/ShoppingListsScreen.tsx
import React, { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { ShoppingBasket } from 'lucide-react-native';

import { ShoppingListData } from '../../../model/domain/shopping.types';
import { styles } from '../styles';
import { HeaderBar } from '../components/HeaderBar';
import { ListCard } from '../components/ListCard';
import { ShareDialog } from '../components/ShareDialog';

type Props = {
  safeTop: number;
  lists: ShoppingListData[];
  onBack: () => void;
  onCreateList: (name: string) => void;
  onOpenList: (id: number) => void;
  onDeleteList: (id: number) => Promise<void>;
  onLeaveList?: (id: number) => Promise<void>;
  onReorder?: (nextLists: ShoppingListData[]) => void;
  onShareList?: (id: number, identifier: string) => void | Promise<void>;
  /** When true, remote/cache loading is in progress and empty state should not be shown. */
  isLoading?: boolean;
};

export function ShoppingListsScreen({
  safeTop,
  lists,
  onBack,
  onCreateList,
  onOpenList,
  onDeleteList,
  onLeaveList,
  onReorder,
  onShareList,
  isLoading = false,
}: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // --- Share dialog state ---
  const [shareForId, setShareForId] = useState<number | null>(null);
  const [shareIdentifier, setShareIdentifier] = useState('');
  const [shareError, setShareError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const keyExtractor = useCallback(
    (item: ShoppingListData, index: number) =>
      Number.isFinite(item.id) ? String(item.id) : `list:${item.name}:${index}`,
    []
  );

  /** Smart delete: if shared and user is not the owner → leave; otherwise → delete. */
  const handleDeleteSmart = useCallback(
    async (id: number) => {
      if (deletingId != null) return;
      try {
        setDeletingId(id);
        const list = lists.find(l => l.id === id);
        const isShared = !!list?.isShared;
        const isOwner = !!(list as any)?.isOwner;
        if (isShared && !isOwner && onLeaveList) {
          await onLeaveList(id);
        } else {
          await onDeleteList(id);
        }
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, lists, onDeleteList, onLeaveList]
  );

  // Always open the share dialog; if not allowed, show an inline error inside the dialog.
  const openShareDialog = useCallback((id: number) => {
    const l = lists.find(x => x.id === id);
    setShareForId(id);
    setShareIdentifier('');
    const notAllowed = !l || !(l as any)?.isOwner;
    setShareError(notAllowed ? 'לא ניתן לשתף: רק הבעלים יכול לשתף רשימה.' : null);
    setIsSharing(false);
  }, [lists]);

  const submitShare = useCallback(async () => {
    if (!shareForId) return;
    const v = (shareIdentifier || '').trim();
    if (!v) return;

    const list = lists.find(l => l.id === shareForId);
    if (!list || !(list as any)?.isOwner) {
      setShareError('לא ניתן לשתף: רק הבעלים יכול לשתף רשימה.');
      return;
    }

    try {
      setIsSharing(true);
      setShareError(null);
      const maybePromise = onShareList?.(shareForId, v);
      if (maybePromise && typeof (maybePromise as any).then === 'function') {
        await (maybePromise as Promise<void>);
      }
      setShareForId(null);
      setShareIdentifier('');
    } catch (e: any) {
      setShareError(typeof e?.message === 'string' ? e.message : 'שגיאה בעת שיתוף הרשימה');
    } finally {
      setIsSharing(false);
    }
  }, [onShareList, shareForId, shareIdentifier, lists]);

  // Show empty state only when not loading and truly empty.
  const showEmpty = !isLoading && lists.length === 0;

  return (
    <View style={[styles.screen, { paddingTop: 10 }]}>
      <HeaderBar onBack={onBack} onCreateList={onCreateList} />

      {showEmpty ? (
        <View style={styles.card}>
          <View style={{ alignItems: 'center' }}>
            <ShoppingBasket size={48} color="#9CA3AF" />
            <Text style={{ color: '#6B7280', marginTop: 8 }}>
              עדיין אין רשימות קניות. צור את הרשימה הראשונה שלך!
            </Text>
          </View>
        </View>
      ) : (
        <DraggableFlatList
          data={lists}
          extraData={lists}   
          keyExtractor={keyExtractor}
          activationDistance={6}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderItem={({ item }) => (
            <ListCard
              item={item}
              safeTop={safeTop}
              deletingId={deletingId}
              onOpenList={onOpenList}
              onDeleteSmart={handleDeleteSmart}
              onOpenShareDialog={openShareDialog}
            />
          )}
          onDragEnd={({ data }) => onReorder?.(data)}
        />
      )}

      <ShareDialog
        visible={shareForId != null}
        identifier={shareIdentifier}
        error={shareError}
        isSharing={isSharing}
        onChangeIdentifier={(t) => {
          setShareIdentifier(t);
          if (shareError) setShareError(null);
        }}
        onCancel={() => setShareForId(null)}
        onSubmit={submitShare}
      />
    </View>
  );
}
