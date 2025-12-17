import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';

type Item = { id: number; name: string; checked: boolean };

type Props = {
  item: Item;
  onToggle: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
  isActive?: boolean;
  style?: ViewStyle;
};

export function ItemRow({ item, onToggle, onDelete, onLongPress, isActive, style }: Props) {
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Trash2 color="#FFFFFF" size={22} />
          <Text style={styles.deleteText}>מחק</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      enabled={!isActive}
    >
      <TouchableOpacity
        onPress={onToggle}
        onLongPress={onLongPress}
        activeOpacity={0.8}
        style={[
          styles.itemRow,
          style,
          isActive && styles.itemRowActive,
        ]}
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
    </Swipeable>
  );
}


const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffffff',
    backgroundColor: '#ababab36',
    marginBottom: 3,
  },
  itemRowActive: {
    backgroundColor: '#E0E7FF',
    borderColor: '#818CF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    marginBottom: 3,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: 100,
    flexDirection: 'row',
    gap: 6,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
