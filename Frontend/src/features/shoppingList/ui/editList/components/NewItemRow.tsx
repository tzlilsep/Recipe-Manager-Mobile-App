// MyApp\Frontend\src\features\shoppingList\ui\components\NewItemRow.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Button } from '../../../../../components/ui/button';

type Props = { onSubmit: (name: string) => void };

export function NewItemRow({ onSubmit }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const name = value.trim();
    if (!name) return;
    onSubmit(name);
    setValue('');
  };

  return (
    <View style={styles.row}>
      <Button onPress={handleSubmit} style={{ marginLeft: 8 }}>
        <Plus size={20} />
      </Button>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="הוסף פריט חדש..."
        placeholderTextColor="#9CA3AF" 
        style={[styles.input, { flex: 1 }]}
        textAlign="right"
        onSubmitEditing={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
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
});
