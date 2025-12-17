// English comments only.

import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  const hasChanges = useMemo(() => JSON.stringify(local) !== JSON.stringify(state), [local, state]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Button variant="outline" onPress={onClose}><Text style={styles.btnText}>סגור</Text></Button>
            <Text style={styles.title}>סינון מתכונים</Text>
            <Button variant="outline" onPress={() => { onReset(); onClose(); }}>
              <Text style={styles.btnText}>איפוס</Text>
            </Button>
          </View>

          <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
            <Text style={styles.label}>חיפוש</Text>
            <TextInput
              value={local.searchText}
              onChangeText={(v) => setLocal(prev => ({ ...prev, searchText: v }))}
              placeholder="לדוגמה: עוגה, קינוח..."
              style={styles.input}
              textAlign="right"
            />

            <Text style={styles.label}>זמן בישול מקסימלי (דקות)</Text>
            <View style={styles.row}>
              {[0, 10, 20, 30, 45, 60, 90, 120].map(n => (
                <Pill
                  key={n}
                  label={n === 0 ? 'ללא' : String(n)}
                  active={local.maxTimeMinutes === n}
                  onPress={() => setLocal(prev => ({ ...prev, maxTimeMinutes: n }))}
                />
              ))}
            </View>

            <Text style={styles.label}>תוויות</Text>
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

            <Text style={styles.label}>מצרכים במקרר</Text>
            <View style={styles.rowWrap}>
              {availableIngredients.map(ing => (
                <Pill
                  key={ing}
                  label={ing}
                  active={local.selectedIngredients.includes(ing)}
                  onPress={() => setLocal(prev => ({
                    ...prev,
                    selectedIngredients: prev.selectedIngredients.includes(ing)
                      ? prev.selectedIngredients.filter(x => x !== ing)
                      : [...prev.selectedIngredients, ing],
                  }))}
                />
              ))}
            </View>

            {showPopularToggle ? (
              <>
                <Text style={styles.label}>פופולריות</Text>
                <Pill
                  label="הצג רק מתכונים פופולריים (30+ שמירות)"
                  active={local.showPopularOnly}
                  onPress={() => setLocal(prev => ({ ...prev, showPopularOnly: !prev.showPopularOnly }))}
                />
              </>
            ) : null}
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
      </View>
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
});
