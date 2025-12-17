// English comments only.

import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Button } from '../../../../components/ui/button';
import { InstructionItem } from '../../model/types';

interface Props {
  value: InstructionItem[];
  onChange: (next: InstructionItem[]) => void;
}

export function InstructionEditor({ value, onChange }: Props) {
  const [text, setText] = useState('');

  const addText = () => {
    if (!text.trim()) return;
    onChange([...value, { type: 'text', content: text.trim() }]);
    setText('');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('שגיאה', 'נדרשת הרשאה לגישה לגלריה');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange([...value, { type: 'image', url: result.assets[0].uri }]);
    }
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <View style={styles.block}>
      <Text style={styles.title}>הוראות הכנה</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="הוסף שלב טקסט"
        style={styles.input}
        textAlign="right"
      />
      <Button onPress={addText}><Text style={styles.primaryText}>הוסף שלב</Text></Button>

      <Button variant="outline" onPress={pickImage}><Text style={styles.btnText}>הוסף תמונת שלב מהגלריה</Text></Button>

      {value.length > 0 ? (
        <GestureHandlerRootView>
          <DraggableFlatList
            data={value.map((item, idx) => ({ ...item, idx }))}
            keyExtractor={(item) => `${item.type}-${item.idx}`}
            scrollEnabled={false}
            onDragEnd={({ data }) => onChange(data.map(({ idx, ...item }) => item))}
            renderItem={({ item, drag, isActive }: RenderItemParams<InstructionItem & { idx: number }>) => (
              <ScaleDecorator>
                <View style={[styles.itemRow, isActive && styles.itemDragging]}>
                  <TouchableOpacity 
                    onPressIn={drag}
                    disabled={isActive}
                    style={styles.dragHandle}
                  >
                    <Text style={styles.dragIcon}>☰</Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    {item.type === 'text' ? (
                      <Text style={styles.itemText}>{item.idx + 1}. {item.content}</Text>
                    ) : (
                      <Image source={{ uri: item.url }} style={styles.stepImage} />
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.removeBtn}
                    onPress={() => remove(item.idx)}
                  >
                    <Text style={styles.removeX}>✕</Text>
                  </TouchableOpacity>
                </View>
              </ScaleDecorator>
            )}
          />
        </GestureHandlerRootView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: 10, gap: 10 },
  title: { textAlign: 'right', fontWeight: '900', color: '#111827' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  primaryText: { color: '#FFFFFF', fontWeight: '900' },
  btnText: { fontWeight: '900', color: '#111827' },
  stepImage: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#E5E7EB' },
  itemRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 10, alignItems: 'center', backgroundColor: '#FFFFFF', padding: 8, borderRadius: 8, marginBottom: 4 },
  itemDragging: { backgroundColor: '#F3F4F6', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  dragHandle: { paddingHorizontal: 8 },
  dragIcon: { fontSize: 20, color: '#9CA3AF' },
  itemText: { flex: 1, textAlign: 'right', color: '#111827' },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  removeX: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
