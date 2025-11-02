// src/features/shoppingList/ui/ShoppingListScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/button';

interface Props {
  onBack: () => void;
}

export function ShoppingListScreen({ onBack }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>רשימת קניות</Text>
        <Button variant="outline" onPress={onBack}>
          <Text style={styles.backText}>חזרה</Text>
        </Button>
      </View>

      <Text style={styles.body}>
        זהו מסך רשימת הקניות (מינימלי). כאן נוסיף תוכן בהמשך.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  backText: { color: '#111827', fontWeight: '600' },
  body: { color: '#4B5563' },
});
