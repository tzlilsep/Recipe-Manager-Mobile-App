// src/features/shoppingList/ui/ShoppingListScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Plus,
  Trash2,
  Check,
  ShoppingBasket,
  Edit2,
} from 'lucide-react-native';
import { Button } from '../../../components/ui/button';
import { useShoppingLists } from '../model/useShoppingLists';
import { ShoppingListData } from '../model/shopping.types';

type Props = {
  onBack: () => void;
  initialLists?: ShoppingListData[];
};

export function ShoppingListScreen({ onBack, initialLists = [] }: Props) {
  const {
    lists,
    selectedListId,
    setSelectedListId,
    currentList,
    addList,
    deleteList,
    renameList,
    addItem,
    deleteItem,
    toggleItem,
    clearCompleted,
  } = useShoppingLists(initialLists);

  const [newListName, setNewListName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [editedListName, setEditedListName] = useState('');
  const [isEditingListName, setIsEditingListName] = useState(false);

  const insets = useSafeAreaInsets();
  const safeTop = insets.top && insets.top > 0 ? insets.top : 44;

  // מסך רשימה נבחרת
  if (selectedListId !== null && currentList) {
    const doneCount = currentList.items.filter((i) => i.checked).length;

    return (
      <SafeAreaView style={[styles.screen, { paddingTop: safeTop + 8 }]} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <Button variant="outline" onPress={() => setSelectedListId(null)}>
            <ArrowRight size={18} style={styles.ml2} />
            <Text>חזור לרשימות</Text>
          </Button>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {!isEditingListName ? (
              <View style={styles.titleRow}>
                <Text style={styles.title}>{currentList.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditedListName(currentList.name);
                    setIsEditingListName(true);
                  }}
                  accessibilityRole="button"
                  style={{ marginLeft: 8 }}
                >
                  <Edit2 size={18} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.renameRow}>
                <TextInput
                  value={editedListName}
                  onChangeText={setEditedListName}
                  placeholder="שם הרשימה"
                  style={[styles.input, { flex: 1 }]}
                  textAlign="right"
                  autoFocus
                  onSubmitEditing={() => {
                    renameList(currentList.id, editedListName);
                    setIsEditingListName(false);
                    setEditedListName('');
                  }}
                />
                <Button
                  onPress={() => {
                    renameList(currentList.id, editedListName);
                    setIsEditingListName(false);
                    setEditedListName('');
                  }}
                  style={{ marginLeft: 8 }}
                >
                  <Text>שמור</Text>
                </Button>
                <Button
                  variant="outline"
                  onPress={() => {
                    setIsEditingListName(false);
                    setEditedListName('');
                  }}
                >
                  <Text>ביטול</Text>
                </Button>
              </View>
            )}

            <Text style={styles.sharedNote}>
              {doneCount} / {currentList.items.length}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* הוספת פריט */}
          <View style={styles.row}>
            <Button
              onPress={() => {
                addItem(currentList.id, newItemName);
                setNewItemName('');
              }}
              style={{ marginLeft: 8 }}
            >
              <Plus size={16} />
            </Button>
            <TextInput
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="הוסף פריט חדש..."
              style={[styles.input, { flex: 1 }]}
              textAlign="right"
              onSubmitEditing={() => {
                addItem(currentList.id, newItemName);
                setNewItemName('');
              }}
            />
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
            {currentList.items.length === 0 ? (
              <Text style={styles.empty}>
                רשימת הקניות ריקה. הוסף פריטים כדי להתחיל!
              </Text>
            ) : (
              currentList.items.map((item, idx) => (
                <View
                  key={item.id}
                  style={[styles.itemRow, idx > 0 && { marginTop: 8 }]}
                >
                  <TouchableOpacity
                    onPress={() => deleteItem(currentList.id, item.id)}
                    accessibilityRole="button"
                    style={styles.iconBtn}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.itemText,
                      item.checked ? styles.itemChecked : undefined,
                    ]}
                  >
                    {item.name}
                  </Text>

                  <TouchableOpacity
                    onPress={() => toggleItem(currentList.id, item.id)}
                    accessibilityRole="button"
                    style={[
                      styles.checkbox,
                      item.checked
                        ? styles.checkboxOn
                        : styles.checkboxOff,
                    ]}
                  >
                    {item.checked ? <Check size={16} /> : null}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          {currentList.items.some((i) => i.checked) && (
            <Button
              variant="outline"
              onPress={() => clearCompleted(currentList.id)}
            >
              <Check size={16} style={styles.ml2} />
              <Text>נקה פריטים שסומנו</Text>
            </Button>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // מסך כל הרשימות
  return (
    <SafeAreaView style={[styles.screen, { paddingTop: safeTop + 8 }]} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <Button variant="outline" onPress={onBack}>
          <ArrowRight size={18} style={styles.ml2} />
          <Text>חזור</Text>
        </Button>

        <View style={styles.row}>
          <Button
            onPress={() => {
              addList(newListName);
              setNewListName('');
            }}
            style={{ marginLeft: 8 }}
          >
            <Plus size={16} style={styles.ml2} />
            <Text>רשימה חדשה</Text>
          </Button>

          <TextInput
            placeholder="לדוגמה: קניות שבועיות"
            value={newListName}
            onChangeText={setNewListName}
            style={[styles.input, { width: 200 }]}
            textAlign="right"
            onSubmitEditing={() => {
              addList(newListName);
              setNewListName('');
            }}
          />
        </View>
      </View>

      {lists.length === 0 ? (
        <View style={styles.card}>
          <View style={[styles.center, { paddingVertical: 32 }]}>
            <ShoppingBasket size={48} color="#9CA3AF" />
            <Text style={{ color: '#6B7280', marginTop: 8 }}>
              עדיין אין רשימות קניות. צור את הרשימה הראשונה שלך!
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
          {lists.map((list, idx) => (
            <TouchableOpacity
              key={list.id}
              activeOpacity={0.8}
              onPress={() => setSelectedListId(list.id)}
              style={[styles.card, idx > 0 && { marginTop: 12 }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <ShoppingBasket size={20} />
                  <Text
                    style={[styles.title, { marginRight: 8 }]}
                  >
                    {list.name}
                  </Text>
                </View>
                <Text style={styles.subtitle}>
                  {list.items.length === 0
                    ? 'רשימה ריקה'
                    : `${list.items.length} פריטים • ${
                        list.items.filter((i) => i.checked).length
                      } הושלמו`}
                </Text>
              </View>

              {list.items.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  {list.items.slice(0, 3).map((item, iidx) => (
                    <Text
                      key={item.id}
                      style={[
                        styles.itemText,
                        { textAlign: 'right' },
                        item.checked ? styles.itemChecked : undefined,
                        iidx > 0 && { marginTop: 4 },
                      ]}
                    >
                      • {item.name}
                    </Text>
                  ))}
                  {list.items.length > 3 && (
                    <Text
                      style={{
                        color: '#9CA3AF',
                        fontSize: 12,
                        textAlign: 'right',
                        marginTop: 4,
                      }}
                    >
                      ועוד {list.items.length - 3} פריטים...
                    </Text>
                  )}
                </View>
              )}

              <View style={[styles.row, { marginTop: 12 }]}>
                <Button
                  variant="outline"
                  onPress={() => setSelectedListId(list.id)}
                  style={{ flex: 1 }}
                >
                  <Edit2 size={16} style={styles.ml2} />
                  <Text>פתח</Text>
                </Button>
                <Button
                  variant="outline"
                  onPress={() => deleteList(list.id)}
                  style={{ marginRight: 8 }}
                >
                  <Trash2 size={16} color="#ef4444" />
                </Button>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  center: { alignItems: 'center', justifyContent: 'center' },

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
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6B7280' },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minWidth: 120,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
  },
  itemText: { flex: 1, fontSize: 16, color: '#111827' },
  itemChecked: { textDecorationLine: 'line-through', color: '#9CA3AF' },

  iconBtn: { padding: 6, borderRadius: 8 },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  checkboxOff: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  ml2: { marginLeft: 8 },

  renameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  sharedNote: {
    fontSize: 12,
    color: '#6B7280',
  },
  empty: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 16,
  },
});
