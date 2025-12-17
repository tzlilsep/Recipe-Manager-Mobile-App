// Frontend/src/features/shoppingList/ui/editList/components/ItemsList.tsx
import React from 'react';
import { Text } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { styles } from '../styles';
import type { ShoppingItem } from '../../../model/domain/shopping.types';
import { ItemRow } from './ItemRow';

type Props = {
  items: ShoppingItem[];
  onToggle: (itemId: number) => void;
  onDelete: (itemId: number) => void;
  onReorder: (newOrder: ShoppingItem[]) => void;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
};

export const ItemsList = ({ items, onToggle, onDelete, onReorder, ListFooterComponent }: Props) => {
  if (items.length === 0) {
    return <Text style={styles.empty}>רשימת הקניות ריקה. הוסף פריטים כדי להתחיל!</Text>;
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ShoppingItem>) => (
    <ScaleDecorator>
      <ItemRow
        item={item}
        onToggle={() => onToggle(item.id)}
        onDelete={() => onDelete(item.id)}
        onLongPress={drag}
        isActive={isActive}
      />
    </ScaleDecorator>
  );

  return (
    <DraggableFlatList
      data={items}
      onDragEnd={({ data }) => onReorder(data)}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={{ paddingTop: 8 }}
    />
  );
};
