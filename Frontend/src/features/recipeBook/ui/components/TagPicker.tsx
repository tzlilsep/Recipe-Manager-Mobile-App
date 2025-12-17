// English comments only.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  availableTags: string[];
  value: string[];
  onChange: (next: string[]) => void;
}

export function TagPicker({ availableTags, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {availableTags.map(tag => {
        const active = value.includes(tag);
        return (
          <TouchableOpacity
            key={tag}
            onPress={() => {
              onChange(active ? value.filter(t => t !== tag) : [...value, tag]);
            }}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{tag}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  pillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  text: { fontWeight: '800', color: '#111827' },
  textActive: { color: '#FFFFFF' },
});
