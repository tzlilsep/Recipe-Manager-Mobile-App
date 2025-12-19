// English comments only.

import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../../../../components/ui/button';
import { AVAILABLE_TAGS } from '../../model/types';
import { RecipeFiltersState } from '../../model/useRecipeBook';

interface Props {
  visible: boolean;
  onClose: () => void;
  availableIngredients: string[];
  showPopularToggle: boolean;
  state: RecipeFiltersState;
  onChange: (next: RecipeFiltersState) => void;
  onReset: () => void;
}

export function RecipeFiltersModal({
  visible,
  onClose,
  availableIngredients,
  showPopularToggle,
  state,
  onChange,
  onReset,
}: Props) {
  const [local, setLocal] = useState<RecipeFiltersState>(state);
  const [ingredientInput, setIngredientInput] = useState('');
  
  // Parse maxTimeMinutes to hours and minutes
  const parseMinutesToTime = (minutes: number) => {
    if (minutes === 0) return { hours: '', minutes: '' };
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return { hours: h > 0 ? String(h) : '', minutes: m > 0 ? String(m) : '' };
  };
  
  const [maxTimeHours, setMaxTimeHours] = useState(() => parseMinutesToTime(state.maxTimeMinutes).hours);
  const [maxTimeMinutes, setMaxTimeMinutes] = useState(() => parseMinutesToTime(state.maxTimeMinutes).minutes);
  
  // Update local.maxTimeMinutes when hours/minutes change
  React.useEffect(() => {
    const h = maxTimeHours ? parseInt(maxTimeHours) : 0;
    const m = maxTimeMinutes ? parseInt(maxTimeMinutes) : 0;
    const total = h * 60 + m;
    setLocal(prev => ({ ...prev, maxTimeMinutes: total }));
  }, [maxTimeHours, maxTimeMinutes]);

  const hasChanges = useMemo(() => JSON.stringify(local) !== JSON.stringify(state), [local, state]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.backdrop} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Button variant="outline" onPress={onClose}><Text style={styles.btnText}>סגור</Text></Button>
            <Text style={styles.title}>סינון מתכונים</Text>
            <Button variant="outline" onPress={() => { 
              const resetState = {
                searchText: '',
                maxTimeMinutes: 0,
                selectedTags: [],
                selectedIngredients: [],
                showPopularOnly: false,
              };
              setLocal(resetState);
              setMaxTimeHours('');
              setMaxTimeMinutes('');
              onChange(resetState);
            }}>
              <Text style={styles.btnText}>איפוס</Text>
            </Button>
          </View>

          <ScrollView 
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>חיפוש לפי שם מתכון:</Text>
            <TextInput
              value={local.searchText}
              onChangeText={(v) => setLocal(prev => ({ ...prev, searchText: v }))}
              placeholder="לדוגמה: עוגה, קינוח..."
              style={styles.input}
              textAlign="right"
            />

            <Text style={styles.label}>זמן הכנה כולל מקסימלי:</Text>
            <View style={styles.timeRow}>
              <TextInput
                value={maxTimeMinutes}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, '').slice(0, 2);
                  if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 59)) {
                    setMaxTimeMinutes(num);
                  }
                }}
                placeholder="00"
                style={styles.timeInput}
                textAlign="center"
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                value={maxTimeHours}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, '').slice(0, 2);
                  setMaxTimeHours(num);
                }}
                placeholder="00"
                style={styles.timeInput}
                textAlign="center"
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            {showPopularToggle ? (
              <>
                <View style={styles.rowWrap}>
                  <Pill
                    label="הצג רק מתכונים פופולריים (30+ שמירות)"
                    active={local.showPopularOnly}
                    onPress={() => setLocal(prev => ({ ...prev, showPopularOnly: !prev.showPopularOnly }))}
                  />
                </View>
              </>
            ) : null}

            <Text style={styles.label}>תוויות:</Text>
            <View style={styles.rowWrap}>
              {AVAILABLE_TAGS.map(tag => (
                <Pill
                  key={tag}
                  label={tag}
                  active={local.selectedTags.includes(tag)}
                  onPress={() => setLocal(prev => ({
                    ...prev,
                    selectedTags: prev.selectedTags.includes(tag)
                      ? prev.selectedTags.filter(t => t !== tag)
                      : [...prev.selectedTags, tag],
                  }))}
                />
              ))}
            </View>

            <Text style={styles.label}>חפש מתכון שמכיל את המצרכים הבאים:</Text>
            <View style={styles.ingredientInputRow}>
              <TextInput
                style={styles.ingredientInput}
                placeholder="הוסף מצרך..."
                value={ingredientInput}
                onChangeText={setIngredientInput}
                textAlign="right"
                onSubmitEditing={() => {
                  const trimmed = ingredientInput.trim();
                  if (trimmed && !local.selectedIngredients.includes(trimmed)) {
                    setLocal(prev => ({ ...prev, selectedIngredients: [...prev.selectedIngredients, trimmed] }));
                    setIngredientInput('');
                  }
                }}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  const trimmed = ingredientInput.trim();
                  if (trimmed && !local.selectedIngredients.includes(trimmed)) {
                    setLocal(prev => ({ ...prev, selectedIngredients: [...prev.selectedIngredients, trimmed] }));
                    setIngredientInput('');
                  }
                }}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.rowWrap}>
              {local.selectedIngredients.map(ing => (
                <Pill
                  key={ing}
                  label={ing}
                  active={true}
                  onPress={() => setLocal(prev => ({
                    ...prev,
                    selectedIngredients: prev.selectedIngredients.filter(x => x !== ing),
                  }))}
                />
              ))}
            </View>
          </ScrollView>

          <Button
            onPress={() => {
              onChange(local);
              onClose();
            }}
            disabled={!hasChanges}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>החל סינון</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, gap: 12, maxHeight: '85%' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { flex: 1, textAlign: 'center', fontWeight: '900', color: '#111827' },
  btnText: { fontWeight: '800', color: '#111827' },
  label: { textAlign: 'right', fontWeight: '900', color: '#111827' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  row: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  rowWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  pillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  pillText: { fontWeight: '800', color: '#111827' },
  pillTextActive: { color: '#FFFFFF' },
  timeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, justifyContent: 'flex-start' },
  timeInput: { width: 50, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 10, textAlign: 'center', color: '#111827', fontSize: 16 },
  timeColon: { fontSize: 20, fontWeight: '900', color: '#111827' },
  timeLabel: { fontSize: 14, color: '#6B7280', marginLeft: 8 },
  ingredientInputRow: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  ingredientInput: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  addButton: { width: 40, height: 40, backgroundColor: '#111827', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', lineHeight: 24 },
});
