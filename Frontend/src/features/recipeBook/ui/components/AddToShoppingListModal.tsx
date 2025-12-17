// English comments only.

import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../../components/ui/button';
import { Ingredient, ShoppingListData } from '../../model/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  shoppingLists: ShoppingListData[];
  ingredients: Ingredient[];
  onSubmit: (listId: number, ingredients: Array<{ name: string; amount?: string; unit?: string }>) => void;
}

export function AddToShoppingListModal({ visible, onClose, shoppingLists, ingredients, onSubmit }: Props) {
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

  const [selected, setSelected] = useState<boolean[]>(() => ingredients.map(() => true));

  // Reset selection when ingredients change
  React.useEffect(() => {
    setSelectedListId(null);
    setSelected(ingredients.map(() => true));
  }, [ingredients]);

  const picked = useMemo(() => {
    return ingredients.filter((_, idx) => selected[idx]).map(i => ({
      name: i.name,
      amount: i.amount,
      unit: i.unit,
    }));
  }, [ingredients, selected]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Button variant="outline" onPress={onClose}><Text style={styles.btnText}>סגור</Text></Button>
            <Text style={styles.title}>הוסף לרשימת קניות</Text>
            <View style={{ width: 72 }} />
          </View>

          <View style={styles.actions}>
            <Button variant="outline" onPress={() => setSelected(ingredients.map(() => true))}>
              <Text style={styles.btnText}>בחר הכל</Text>
            </Button>
            <Button variant="outline" onPress={() => setSelected(ingredients.map(() => false))}>
              <Text style={styles.btnText}>בטל הכל</Text>
            </Button>
          </View>

          <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
            {ingredients.map((ing, idx) => {
              const checked = selected[idx];
              return (
                <TouchableOpacity
                  key={`${ing.name}-${idx}`}
                  onPress={() => setSelected(prev => prev.map((v, i) => (i === idx ? !v : v)))}
                  style={[styles.ingRow, checked && styles.ingRowChecked]}
                >
                  <Text style={styles.ingText}>
                    {ing.name}{ing.amount ? ` - ${ing.amount}` : ''}{ing.unit ? ` ${ing.unit}` : ''}
                  </Text>
                  <Text style={styles.check}>{checked ? '✓' : ''}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>בחר רשימת קניות</Text>
          <View style={styles.listsWrap}>
            {shoppingLists.map(list => {
              const active = selectedListId === list.id;
              return (
                <TouchableOpacity
                  key={list.id}
                  onPress={() => setSelectedListId(list.id)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{list.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            onPress={() => {
              if (!selectedListId || picked.length === 0) return;
              onSubmit(selectedListId, picked);
            }}
            disabled={!selectedListId || picked.length === 0}
          >
            <Text style={styles.primaryText}>הוסף {picked.length} מצרכים</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, gap: 12, maxHeight: '85%' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { flex: 1, textAlign: 'center', fontWeight: '900', color: '#111827' },
  btnText: { fontWeight: '900', color: '#111827' },
  actions: { flexDirection: 'row-reverse', gap: 10, justifyContent: 'flex-end' },
  ingRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 10 },
  ingRowChecked: { backgroundColor: '#F9FAFB' },
  ingText: { flex: 1, textAlign: 'right', color: '#111827', fontWeight: '700' },
  check: { width: 24, textAlign: 'center', fontWeight: '900', color: '#111827' },
  label: { textAlign: 'right', fontWeight: '900', color: '#111827' },
  listsWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  pillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  pillText: { fontWeight: '800', color: '#111827' },
  pillTextActive: { color: '#FFFFFF' },
  primaryText: { color: '#FFFFFF', fontWeight: '900' },
});
