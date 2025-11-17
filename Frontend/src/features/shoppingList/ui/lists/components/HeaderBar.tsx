// Frontend/src/features/shoppingList/ui/lists/components/HeaderBar.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Button } from '../../../../../components/ui/button';
import { styles } from '../styles';
import { NewListForm } from '../components/NewListForm';

type Props = {
  onBack: () => void;
  onCreateList: (name: string) => void;
};

export const HeaderBar = ({ onBack, onCreateList }: Props) => {
  return (
    <View style={styles.headerRow}>
      <Button variant="outline" onPress={onBack}>
        <Text>חזור</Text>
        <ArrowLeft size={18} style={{ marginRight: 8 }} />
      </Button>
      <NewListForm onSubmit={onCreateList} />
    </View>
  );
};
