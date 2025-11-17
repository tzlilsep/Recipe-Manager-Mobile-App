// Frontend/src/features/shoppingList/ui/editList/components/TitleEditor.tsx
import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Edit2 } from 'lucide-react-native';
import { Button } from '../../../../../components/ui/button';
import { styles } from '../styles';

type Props = {
  name: string;
  done: number;
  total: number;
  onRename: (name: string) => void;
};

export const TitleEditor = ({ name, done, total, onRename }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState(name);

  return (
    <View style={styles.cardHeader}>
      {!isEditing ? (
        <View style={styles.titleRow}>
          <Text style={styles.title}>{name}</Text>
          <Button
            variant="outline"
            onPress={() => {
              setEdited(name);
              setIsEditing(true);
            }}
            style={styles.editIconBtn}
          >
            <Edit2 size={20} />
          </Button>
        </View>
      ) : (
        <View style={styles.renameRow}>
          <TextInput
            value={edited}
            onChangeText={setEdited}
            placeholder="שם הרשימה"
            style={[styles.input, { flex: 1 }]}
            textAlign="right"
            autoFocus
            onSubmitEditing={() => {
              onRename(edited);
              setIsEditing(false);
            }}
          />
          <Button
            onPress={() => {
              onRename(edited);
              setIsEditing(false);
            }}
            style={{ marginLeft: 8 }}
          >
            <Text>שמור</Text>
          </Button>
          <Button variant="outline" onPress={() => setIsEditing(false)}>
            <Text>ביטול</Text>
          </Button>
        </View>
      )}

      <Text style={[styles.sharedNote, isEditing && { opacity: 0 }]}>
        {done} / {total}
      </Text>
    </View>
  );
};
