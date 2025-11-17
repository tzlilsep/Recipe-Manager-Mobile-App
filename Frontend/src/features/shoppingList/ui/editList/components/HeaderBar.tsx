// Frontend/src/features/shoppingList/ui/editList/components/HeaderBar.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Button } from '../../../../../components/ui/button';
import { styles } from '../styles';

export const HeaderBar = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.headerRow}>
    <Button variant="outline" onPress={onBack}>
      <Text>חזור לרשימות</Text>
      <ArrowLeft size={18} style={{ marginRight: 8 }} />
    </Button>
  </View>
);
