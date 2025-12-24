// English comments only.

import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

interface Props {
  filterText: string;
  setFilterText: (text: string) => void;
}

export function IngredientFilter({ filterText, setFilterText }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        value={filterText}
        onChangeText={setFilterText}
        placeholder="חפש מצרכים..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    textAlign: 'right',
  },
});