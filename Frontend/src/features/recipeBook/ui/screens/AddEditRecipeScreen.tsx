// English comments only.

import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../../../components/ui/button';
import { AVAILABLE_TAGS } from '../../model/types';
import { Ingredient, InstructionItem, Recipe } from '../../model/types';
import { IngredientEditor, InstructionEditor, TagPicker } from '../components';

interface Props {
  editingRecipe: Recipe | null;
  onSave: (recipe: Recipe) => void;
}

export function AddEditRecipeScreen({ editingRecipe, onSave }: Props) {
  const isEdit = !!editingRecipe;

  const [title, setTitle] = useState(editingRecipe?.title ?? '');
  const [workTime, setWorkTime] = useState(editingRecipe?.workTime ?? '');
  const [totalTime, setTotalTime] = useState(editingRecipe?.totalTime ?? '');
  const [servings, setServings] = useState(editingRecipe?.servings ? String(editingRecipe.servings) : '');
  const [imageUrl, setImageUrl] = useState(editingRecipe?.imageUrl ?? '');
  const [tags, setTags] = useState<string[]>(editingRecipe?.tags ?? []);
  const [tips, setTips] = useState(editingRecipe?.tips ?? '');

  const [ingredients, setIngredients] = useState<Ingredient[]>(editingRecipe?.ingredients ?? []);
  const [instructions, setInstructions] = useState<InstructionItem[]>(editingRecipe?.instructions ?? []);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('שגיאה', 'נדרשת הרשאה לגישה לגלריה');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!canSave) return;

    const recipe: Recipe = {
      id: editingRecipe?.id ?? Date.now(),
      title: title.trim(),
      ingredients,
      instructions,
      workTime: workTime.trim() || undefined,
      totalTime: totalTime.trim() || undefined,
      servings: servings.trim() ? Number(servings) : undefined,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1080&q=80',
      tags,
      tips: tips.trim() || undefined,
      author: editingRecipe?.author,
      copiedFrom: editingRecipe?.copiedFrom,
      saveCount: editingRecipe?.saveCount,
    };

    onSave(recipe);
  };

  const handleReset = () => {
    setTitle('');
    setWorkTime('');
    setTotalTime('');
    setServings('');
    setImageUrl('');
    setTags([]);
    setTips('');
    setIngredients([]);
    setInstructions([]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Button variant="outline" onPress={handleReset}><Text style={styles.btnText}>איפוס</Text></Button>
        <Text style={styles.title}>{isEdit ? 'עריכת מתכון' : 'מתכון חדש'}</Text>
        <Button variant="outline" onPress={handleSave} disabled={!canSave}>
          <Text style={styles.btnText}>{isEdit ? 'שמור' : 'הוסף'}</Text>
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>שם המתכון *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="לדוגמה: עוגת שוקולד"
          style={styles.input}
          textAlign="right"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>זמן עבודה</Text>
            <TextInput
              value={workTime}
              onChangeText={setWorkTime}
              placeholder="15 דקות"
              style={styles.input}
              textAlign="right"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>זמן כולל</Text>
            <TextInput
              value={totalTime}
              onChangeText={setTotalTime}
              placeholder="45 דקות"
              style={styles.input}
              textAlign="right"
            />
          </View>
        </View>

        <Text style={styles.label}>מנות</Text>
        <TextInput
          value={servings}
          onChangeText={setServings}
          keyboardType="number-pad"
          placeholder="4"
          style={styles.input}
          textAlign="right"
        />

        <Text style={styles.label}>תמונת המתכון</Text>
        <View style={styles.imageRow}>
          <Button variant="outline" onPress={pickImage}>
            <Text style={styles.btnText}>בחר תמונה מהגלריה</Text>
          </Button>
          {imageUrl.trim() ? (
            <Button variant="outline" onPress={() => setImageUrl('')}>
              <Text style={styles.removeImageText}>הסר תמונה</Text>
            </Button>
          ) : null}
        </View>
        {imageUrl.trim() ? (
          <Image source={{ uri: imageUrl.trim() }} style={styles.preview} />
        ) : null}

        <IngredientEditor value={ingredients} onChange={setIngredients} />
        <InstructionEditor value={instructions} onChange={setInstructions} />

        <Text style={styles.sectionTitle}>תוויות</Text>
        <TagPicker availableTags={[...AVAILABLE_TAGS]} value={tags} onChange={setTags} />

        <Text style={styles.sectionTitle}>טיפים והמלצות</Text>
        <TextInput
          value={tips}
          onChangeText={setTips}
          placeholder="הוסף טיפים שימושיים..."
          style={[styles.input, styles.textarea]}
          multiline
          textAlign="right"
        />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: { padding: 16, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { flex: 1, fontSize: 16, fontWeight: '900', color: '#111827', textAlign: 'right' },
  btnText: { fontWeight: '800', color: '#111827' },
  content: { padding: 16, gap: 10 },
  label: { textAlign: 'right', fontWeight: '800', color: '#111827', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  imageRow: { flexDirection: 'row-reverse', gap: 10, alignItems: 'center' },
  removeImageText: { fontWeight: '800', color: '#EF4444', fontSize: 12 },
  textarea: { minHeight: 110, paddingTop: 12 },
  row: { flexDirection: 'row-reverse', gap: 10 },
  col: { flex: 1 },
  preview: { width: '100%', height: 180, borderRadius: 14, backgroundColor: '#E5E7EB', marginTop: 8 },
  sectionTitle: { textAlign: 'right', fontWeight: '900', color: '#111827', fontSize: 14, marginTop: 10 },
});
