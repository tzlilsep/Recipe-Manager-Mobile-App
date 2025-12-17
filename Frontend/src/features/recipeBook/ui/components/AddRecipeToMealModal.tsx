// English comments only.

import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../../components/ui/button';
import { Meal, Recipe } from '../../model/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  meal: Meal | null;
  recipes: Recipe[];
  onPickRecipe: (recipeId: number | string) => void;
}

export function AddRecipeToMealModal({ visible, onClose, meal, recipes, onPickRecipe }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Button variant="outline" onPress={onClose}><Text style={styles.btnText}>סגור</Text></Button>
            <Text style={styles.title}>הוסף לארוחה</Text>
            <View style={{ width: 72 }} />
          </View>

          <Text style={styles.subtitle} numberOfLines={1}>
            {meal ? `בחר מתכון להוספה ל"${meal.name}"` : 'בחר מתכון'}
          </Text>

          <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
            {recipes.map(r => (
              <TouchableOpacity key={r.id} style={styles.row} onPress={() => onPickRecipe(r.id)}>
                <Text style={styles.rowText}>{r.title}</Text>
                <Text style={styles.plus}>＋</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  subtitle: { textAlign: 'right', color: '#6B7280' },
  btnText: { fontWeight: '900', color: '#111827' },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12 },
  rowText: { flex: 1, textAlign: 'right', fontWeight: '800', color: '#111827' },
  plus: { fontWeight: '900', color: '#111827', width: 24, textAlign: 'center' },
});
