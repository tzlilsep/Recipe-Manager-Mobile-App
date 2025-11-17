// Frontend/src/features/shoppingList/ui/editList/components/CompletedActions.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ArrowDown, Check } from 'lucide-react-native';
import { Button } from '../../../../../components/ui/button';
import { styles } from '../styles';

type Props = {
  visible: boolean;
  onMoveCompletedToEnd: () => void;
  onClearCompleted: () => void;
};

export const CompletedActions = ({ visible, onMoveCompletedToEnd, onClearCompleted }: Props) => {
  if (!visible) return null;
  return (
    <View style={{ marginTop: 6 }}>
      <Button variant="outline" onPress={onMoveCompletedToEnd}>
        <ArrowDown size={16} style={styles.ml2} />
        <Text>הורד פריטים שסומנו לסוף</Text>
      </Button>

      <View style={{ height: 8 }} />
      <Button variant="outline" onPress={onClearCompleted}>
        <Check size={16} style={styles.ml2} />
        <Text>נקה פריטים שסומנו</Text>
      </Button>
    </View>
  );
};
