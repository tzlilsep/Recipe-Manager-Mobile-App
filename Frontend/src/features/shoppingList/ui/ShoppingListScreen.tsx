// Frontend/src/features/shoppingList/ui/ShoppingListScreen.tsx
import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingListData } from '../model/domain/shopping.types';
import { ShoppingListsScreen } from './lists/screens/ShoppingListsScreen';
import { ShoppingListDetailsScreen } from './editList/screens/ShoppingListDetailsScreen';
import { useShoppingListsController } from '../model/useShoppingListsController';

type Props = { onBack: () => void; initialLists?: ShoppingListData[]; };

export function ShoppingListScreen({ onBack, initialLists = [] }: Props) {
  const { top } = useSafeAreaInsets();
  const safeTop = top && top > 0 ? top : 44;

  const c = useShoppingListsController(initialLists);

  // Do NOT early-return null; we seed initial state synchronously in the controller now.
  const listsIsLoading =
    !c.isReady || (c.lists.length === 0 && (c as any).isSyncingRemote);

  if (c.selectedListId !== null && c.currentList) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top','left','right']}>
        <ShoppingListDetailsScreen
          safeTop={safeTop}
          list={c.currentList}
          onBack={c.closeList}
          onRename={c.saveName}
          onAddItem={c.addItem}
          onToggleItem={c.toggleItem}
          onDeleteItem={c.deleteItem}
          onClearCompleted={c.clearCompleted}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top','left','right']}>
      <ShoppingListsScreen
        safeTop={safeTop}
        lists={c.lists}
        isLoading={listsIsLoading}
        onBack={onBack}
        onCreateList={c.createList}
        onOpenList={c.openList}
        onDeleteList={c.deleteListSmart}
        onLeaveList={c.leaveList}
        onReorder={c.reorder}
        onShareList={c.share}
      />
    </SafeAreaView>
  );
}
