// Frontend/src/features/shoppingList/ui/editList/screens/ShoppingListDetailsScreen.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';

import type { ShoppingListData } from '../../../model/domain/shopping.types';
import { doneCount, hasCompleted } from '../../../model/domain/selectors';

import { styles } from '../styles';
import { HeaderBar } from '../components/HeaderBar';
import { TitleEditor } from '../components/TitleEditor';
import { NewItemRow } from '../components/NewItemRow';
import { ItemsList } from '../components/ItemsList';
import { CompletedActions } from '../components/CompletedActions';

type Props = {
  safeTop: number;
  list: ShoppingListData;
  onBack: () => void;
  onRename: (name: string) => void;
  onAddItem: (name: string) => void;
  onToggleItem: (itemId: number) => void;
  onDeleteItem: (itemId: number) => void;
  onReorderItems: (newOrder: any[]) => void;
  onClearCompleted: () => void;
};

export function ShoppingListDetailsScreen({
  list,
  onBack,
  onRename,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onReorderItems,
  onClearCompleted,
}: Props) {
  // נשאיר את הפעולה שלך כפי שהיא (על אף שמוטציה במקום אינה אידאלית)
  const onMoveCompletedToEnd = (l: ShoppingListData) => {
    const reordered = [
      ...l.items.filter(i => !i.checked),
      ...l.items.filter(i => i.checked),
    ];
    l.items = reordered;
    onRename(l.name);
  };

  return (
    <View style={[styles.screen, { paddingTop: 10 }]}>
      <HeaderBar onBack={onBack} />

      <View style={styles.card}>
        <TitleEditor
          name={list.name}
          done={doneCount(list)}
          total={list.items.length}
          onRename={onRename}
        />

        <View style={styles.divider} />

        <NewItemRow onSubmit={onAddItem} />

        <View style={{ flex: 1 }}>
          <ItemsList items={list.items} onToggle={onToggleItem} onDelete={onDeleteItem} onReorder={onReorderItems} />
        </View>

        {hasCompleted(list) && (
          <CompletedActions
            visible={hasCompleted(list)}
            onMoveCompletedToEnd={() => onMoveCompletedToEnd(list)}
            onClearCompleted={onClearCompleted}
          />
        )}
      </View>
    </View>
  );
}
