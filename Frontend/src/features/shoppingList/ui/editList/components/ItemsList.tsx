// Frontend/src/features/shoppingList/ui/editList/components/ItemsList.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import type { ShoppingItem } from '../../../model/domain/shopping.types';
import { ItemRow } from './ItemRow';

type Props = {
  items: ShoppingItem[];
  onToggle: (itemId: number) => void;
  onDelete: (itemId: number) => void;
};

export const ItemsList = ({ items, onToggle, onDelete }: Props) => {
  if (items.length === 0) {
    return <Text style={styles.empty}>רשימת הקניות ריקה. הוסף פריטים כדי להתחיל!</Text>;
  }
  return (
    <View>
      {items.map((item, idx) => (
        <ItemRow
          key={item.id}
          item={item}
          style={idx > 0 ? { marginTop: 0 } : undefined}
          onToggle={() => onToggle(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </View>
  );
};
