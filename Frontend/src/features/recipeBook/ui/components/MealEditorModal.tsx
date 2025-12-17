// English comments only.

import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../../../components/ui/button';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, imageUrl?: string) => void;
}

export function MealEditorModal({ visible, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>ארוחה חדשה</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="לדוגמה: ארוחת שישי"
            style={styles.input}
            textAlign="right"
          />

          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="תמונה (URL אופציונלי)"
            style={styles.input}
            textAlign="right"
          />

          <View style={styles.row}>
            <Button variant="outline" onPress={onClose}><Text style={styles.btnText}>ביטול</Text></Button>
            <Button
              onPress={() => {
                if (!name.trim()) return;
                onSubmit(name.trim(), imageUrl.trim() || undefined);
                setName('');
                setImageUrl('');
              }}
              disabled={!name.trim()}
            >
              <Text style={styles.primaryText}>הוסף</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, gap: 12 },
  title: { textAlign: 'right', fontWeight: '900', color: '#111827' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 10 },
  btnText: { fontWeight: '900', color: '#111827' },
  primaryText: { color: '#FFFFFF', fontWeight: '900' },
});
