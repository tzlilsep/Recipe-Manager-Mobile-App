import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { ArrowLeft, Edit2, ShoppingBasket, Trash2 } from 'lucide-react-native';
import { Button } from '../../../../components/ui/button';
import { ShoppingListData, ShoppingItem } from '../../model/shopping.types';
import { previewItems } from '../../model/selectors';
import { NewListForm } from '../components/NewListForm';
import { EmptyState } from '../components/EmptyState';

type Props = {
  safeTop: number;
  lists: ShoppingListData[];                 // already sorted by parent
  onBack: () => void;
  onCreateList: (name: string) => void;
  onOpenList: (id: number) => void;
  onDeleteList: (id: number) => Promise<void>; // <-- הפיך לאסינכרוני כדי לבצע DELETE בענן
  onReorder?: (nextLists: ShoppingListData[]) => void; // parent persists order
};

export function ShoppingListsScreen({
  safeTop,
  lists,
  onBack,
  onCreateList,
  onOpenList,
  onDeleteList,
  onReorder,
}: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const keyExtractor = useCallback(
    (item: ShoppingListData, index: number) =>
      Number.isFinite(item.id) ? String(item.id) : `list:${item.name}:${index}`,
    []
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (deletingId != null) return; // מניעת מחיקות כפולות במקביל
      try {
        setDeletingId(id);
        await onDeleteList(id);       // ההורה מבצע DELETE לשרת ומעדכן state/Cache
      } finally {
        setDeletingId(null);
      }
    },
    [onDeleteList, deletingId]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<ShoppingListData>) => {
      const isDeleting = deletingId === item.id;
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onOpenList(item.id)}
          onLongPress={drag} // Long-press to initiate drag
          style={[styles.card, isActive && { opacity: 0.9 }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <ShoppingBasket size={20} />
              <Text style={[styles.title, { marginRight: 8 }]}>{item.name}</Text>
            </View>
            <Text style={styles.subtitle}>
              {item.items.length === 0
                ? 'רשימה ריקה'
                : `${item.items.length} פריטים • ${item.items.filter(i => i.checked).length} הושלמו`}
            </Text>
          </View>

          {item.items.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {previewItems(item, 3).map((sub: ShoppingItem, iidx: number) => (
                <Text
                  key={Number.isFinite(sub.id) ? String(sub.id) : `item:${sub.name}:${iidx}`}
                  style={[
                    styles.itemText,
                    { textAlign: 'right' },
                    sub.checked ? styles.itemChecked : undefined,
                    iidx > 0 && { marginTop: 4 },
                  ]}
                >
                  • {sub.name}
                </Text>
              ))}
              {item.items.length > 3 && (
                <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'right', marginTop: 4 }}>
                  ועוד {item.items.length - 3} פריטים...
                </Text>
              )}
            </View>
          )}

          <View style={[styles.row, { marginTop: 12 }]}>
            <Button variant="outline" onPress={() => onOpenList(item.id)} style={{ flex: 1 }}>
              <Edit2 size={16} style={{ marginLeft: 8 }} />
              <Text>פתח</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => handleDelete(item.id)}
              style={{ marginRight: 8 }}
              disabled={isDeleting}
            >
              <Trash2 size={16} color={isDeleting ? '#9CA3AF' : '#ef4444'} />
              {isDeleting && <Text style={{ marginRight: 6 }}>מוחק…</Text>}
            </Button>
          </View>
        </TouchableOpacity>
      );
    },
    [onDeleteList, onOpenList, deletingId, handleDelete]
  );

  return (
    <View style={[styles.screen, { paddingTop: 10 }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Button variant="outline" onPress={onBack}>
          <Text>חזור</Text>
          <ArrowLeft size={18} style={{ marginRight: 8 }} />
        </Button>

        <NewListForm onSubmit={onCreateList} />
      </View>

      {/* Empty state */}
      {lists.length === 0 ? (
        <View style={styles.card}>
          <EmptyState
            icon={<ShoppingBasket size={48} color="#9CA3AF" />}
            text="עדיין אין רשימות קניות. צור את הרשימה הראשונה שלך!"
          />
        </View>
      ) : (
        <DraggableFlatList
          data={lists}                      // parent-provided, already sorted
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 12 }}
          activationDistance={6}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          onDragEnd={({ data }: { data: ShoppingListData[] }) => {
            onReorder?.(data);             // ההורה יעדכן סדר ויתמיד — לא משנים order כאן במחיקה
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EEF2FF', paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: { flexDirection: 'row-reverse', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6B7280' },
  itemText: { flex: 1, fontSize: 16, color: '#111827' },
  itemChecked: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  ml2: { marginLeft: 8 },
});
