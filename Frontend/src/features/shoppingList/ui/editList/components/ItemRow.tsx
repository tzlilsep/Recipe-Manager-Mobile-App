import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';

type Item = { id: number; name: string; checked: boolean };

type Props = {
  item: Item;
  onToggle: () => void;
  onDelete: () => void;
  style?: ViewStyle;
};

export function ItemRow({ item, onToggle, onDelete, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8} // אפקט קל בלחיצה
      style={[styles.itemRow, style]}
    >
      <Text style={[styles.itemText, item.checked ? styles.itemChecked : undefined]}>
        {item.name}
      </Text>

      <View
        style={[styles.checkbox, item.checked ? styles.checkboxOn : styles.checkboxOff]}
      >
        {item.checked ? <Check size={22} /> : null}
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  itemRow: {
    marginTop: 10, 

    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
     borderWidth: 1,
    borderColor: '#ffffffff',
    backgroundColor: '#ababab36',
    marginBottom: 8,
  },
  itemText: { flex: 1, fontSize: 20, color: '#000000ff',textAlign: 'right' },
  itemChecked: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  iconBtn: { padding: 6, borderRadius: 8 },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#16A34A' },
  checkboxOff: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB' },
});
