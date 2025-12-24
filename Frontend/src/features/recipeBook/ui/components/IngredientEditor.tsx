// English comments only.

import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Button } from '../../../../components/ui/button';
import { Ingredient } from '../../model/types';
import { AMOUNT_HELP_TEXT, validateAmount, formatIngredientDisplay } from '../../model/ingredientFormatter';

interface Props {
  value: Ingredient[];
  onChange: (next: Ingredient[]) => void;
}

const UNITS = ['יחידה','גרם','קילו','כוס','כף','כפית','ליטר','מ"ל','שיניים','חבילה','לפי הטעם','ללא'];

export function IngredientEditor({ value, onChange }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('יחידה');
  const [groupTitle, setGroupTitle] = useState('');
  const [unitModalOpen, setUnitModalOpen] = useState(false);

  const add = () => {
    if (!name.trim()) return;
    
    // Validate amount if provided
    const amountTrimmed = amount.trim();
    let normalizedAmount: string | undefined = undefined;
    
    if (amountTrimmed) {
      const validation = validateAmount(amountTrimmed);
      if (!validation.ok) {
        Alert.alert('שגיאה בכמות', validation.error);
        return;
      }
      normalizedAmount = validation.normalized;
    }
    
    const ing: Ingredient = { name: name.trim(), amount: normalizedAmount, unit: unit || undefined };
    if (groupTitle.trim()) ing.groupTitle = groupTitle.trim();
    onChange([...value, ing]);
    setName('');
    setAmount('');
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  // Create flat list with group headers
  type ListItem = 
    | { type: 'header'; groupName: string; id: string }
    | { type: 'ingredient'; data: Ingredient; originalIdx: number; id: string };

  const groupedIngredients = value.reduce((acc, ing, idx) => {
    const group = ing.groupTitle || 'ללא קבוצה';
    if (!acc[group]) acc[group] = [];
    acc[group].push({ ...ing, originalIdx: idx });
    return acc;
  }, {} as Record<string, Array<Ingredient & { originalIdx: number }>>);

  const groupKeys = Object.keys(groupedIngredients).sort((a, b) => {
    if (a === 'ללא קבוצה') return 1;
    if (b === 'ללא קבוצה') return -1;
    return a.localeCompare(b);
  });

  // Build flat list with headers and items
  const flatList: ListItem[] = [];
  groupKeys.forEach(groupName => {
    flatList.push({ type: 'header', groupName, id: `header-${groupName}` });
    groupedIngredients[groupName].forEach(ing => {
      flatList.push({ type: 'ingredient', data: ing, originalIdx: ing.originalIdx, id: `ing-${ing.originalIdx}` });
    });
  });

  const showAmountHelp = () => {
    Alert.alert('', AMOUNT_HELP_TEXT, [{ text: 'סגור' }]);
  };

  return (
    <View style={styles.block}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>מצרכים</Text>
        <TouchableOpacity onPress={showAmountHelp} style={styles.infoButton}>
          <Text style={styles.infoIcon}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={groupTitle}
        onChangeText={setGroupTitle}
        placeholder="כותרת קבוצה (אופציונלי)"
        style={styles.input}
        textAlign="right"
        placeholderTextColor="#9CA3AF"
      />

      <View style={styles.row}>
        <TextInput 
          value={amount} 
          onChangeText={setAmount} 
          placeholder="כמות" 
          style={[styles.input, styles.small]} 
          textAlign="right" 
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity onPress={() => setUnitModalOpen(true)}>
          <Text style={styles.unitPill}>{unit}</Text>
        </TouchableOpacity>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="שם המצרך"
          style={[styles.input, styles.flex]}
          textAlign="right"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <Button onPress={add}><Text style={styles.primaryText}>הוסף מצרך</Text></Button>

      {value.length > 0 ? (
        <GestureHandlerRootView>
          <DraggableFlatList
            data={flatList}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            onDragEnd={({ data }) => {
              // Rebuild ingredients array based on new order
              const newIngredients: Ingredient[] = [];
              let currentGroup: string | undefined;
              
              data.forEach(item => {
                if (item.type === 'header') {
                  currentGroup = item.groupName === 'ללא קבוצה' ? undefined : item.groupName;
                } else {
                  const originalIng = value[item.originalIdx];
                  newIngredients.push({ ...originalIng, groupTitle: currentGroup });
                }
              });
              
              onChange(newIngredients);
            }}
            renderItem={({ item, drag, isActive }: RenderItemParams<ListItem>) => {
              if (item.type === 'header') {
                return (
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>{item.groupName}</Text>
                  </View>
                );
              }
              
              return (
                <ScaleDecorator>
                  <View style={[styles.itemRow, isActive && styles.itemDragging]}>
                    <View style={styles.itemContent}>
                      <TouchableOpacity 
                        onPressIn={drag}
                        disabled={isActive}
                        style={styles.dragHandle}
                      >
                        <Text style={styles.dragIcon}>☰</Text>
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemText}>
                          {formatIngredientDisplay(item.data)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeBtn}
                      onPress={() => remove(item.originalIdx)}
                    >
                      <Text style={styles.removeX}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </ScaleDecorator>
              );
            }}
          />
        </GestureHandlerRootView>
      ) : null}

      <Modal visible={unitModalOpen} transparent animationType="fade" onRequestClose={() => setUnitModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setUnitModalOpen(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>בחר יחידת מידה</Text>
            <ScrollView style={styles.modalScroll}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitOption, unit === u && styles.unitOptionSelected]}
                  onPress={() => {
                    setUnit(u);
                    setUnitModalOpen(false);
                  }}
                >
                  <Text style={[styles.unitOptionText, unit === u && styles.unitOptionTextSelected]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button variant="outline" onPress={() => setUnitModalOpen(false)}>
              <Text style={styles.closeText}>סגור</Text>
            </Button>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: 10, gap: 10 },
  titleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  title: { textAlign: 'right', fontWeight: '900', color: '#111827' },
  infoButton: { padding: 4 },
  infoIcon: { fontSize: 18, color: '#6B7280' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  row: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  small: { width: 90 },
  flex: { flex: 1 },
  unitPill: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, fontWeight: '900', color: '#111827' },
  primaryText: { color: '#FFFFFF', fontWeight: '900' },
  groupHeader: { borderLeftWidth: 3, borderLeftColor: '#111827', paddingLeft: 12, marginTop: 12, marginBottom: 4 },
  groupTitle: { fontSize: 16, fontWeight: '900', color: '#111827', textAlign: 'right' },
  itemRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', padding: 8, borderRadius: 8, marginBottom: 4, marginLeft: 15 },
  itemDragging: { backgroundColor: '#F3F4F6', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  dragHandle: { paddingHorizontal: 8 },
  dragIcon: { fontSize: 20, color: '#9CA3AF' },
  itemContent: { flex: 1, flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  itemText: { textAlign: 'right', color: '#111827', fontSize: 14 },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  removeX: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: '#111827' },
  modalScroll: { maxHeight: 300, marginBottom: 16 },
  unitOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, backgroundColor: '#F9FAFB' },
  unitOptionSelected: { backgroundColor: '#111827' },
  unitOptionText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#111827' },
  unitOptionTextSelected: { color: '#FFFFFF' },
  closeText: { fontWeight: '900', color: '#111827' },
});