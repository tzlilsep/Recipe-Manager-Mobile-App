// MyApp\Frontend\src\features\shoppingList\ui\components\NewListForm.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Button } from '../../../../../components/ui/button';

type Props = {
  onSubmit: (name: string) => void;
};

export function NewListForm({ onSubmit }: Props) {
  const handleSubmit = () => {
    onSubmit('רשימת קניות חדשה');
  };

    return (
    <View style={styles.row}>
      <Button onPress={handleSubmit} style={{ marginLeft: 8, backgroundColor: '#e2857bff' }}>
        <Plus size={16} />
        <Text style={{ marginRight: 6 }}>הוסף רשימה</Text>
      </Button>
    </View>
  );

}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
});