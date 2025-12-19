// English comments only.

import React, { useMemo, useRef, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const scrollViewRef = useRef<ScrollView>(null);

  const [title, setTitle] = useState(editingRecipe?.title ?? '');
  const [workTime, setWorkTime] = useState(editingRecipe?.workTime ?? '');
  const [totalTime, setTotalTime] = useState(editingRecipe?.totalTime ?? '');
  const [servings, setServings] = useState(editingRecipe?.servings ? String(editingRecipe.servings) : '');
  
  // Parse initial times
  const parseTime = (time: string) => {
    if (!time || time.trim() === '') return { hours: '', minutes: '' };
    const parts = time.split(':');
    return { hours: parts[0] || '', minutes: parts[1] || '' };
  };
  
  const [workHours, setWorkHours] = useState(() => parseTime(editingRecipe?.workTime ?? '').hours);
  const [workMinutes, setWorkMinutes] = useState(() => parseTime(editingRecipe?.workTime ?? '').minutes);
  const [totalHours, setTotalHours] = useState(() => parseTime(editingRecipe?.totalTime ?? '').hours);
  const [totalMinutes, setTotalMinutes] = useState(() => parseTime(editingRecipe?.totalTime ?? '').minutes);
  
  const [imageUrl, setImageUrl] = useState(editingRecipe?.imageUrl ?? '');
  const [tags, setTags] = useState<string[]>(editingRecipe?.tags ?? []);
  const [tips, setTips] = useState(editingRecipe?.tips ?? '');

  const [ingredients, setIngredients] = useState<Ingredient[]>(editingRecipe?.ingredients ?? []);
  const [instructions, setInstructions] = useState<InstructionItem[]>(editingRecipe?.instructions ?? []);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  // Format time from hours and minutes
  const formatTime = (hours: string, minutes: string): string => {
    const h = hours.trim();
    const m = minutes.trim();
    if (!h && !m) return '';
    const hh = h ? h.padStart(2, '0') : '00';
    const mm = m ? m.padStart(2, '0') : '00';
    return `${hh}:${mm}`;
  };

  // Update workTime when hours/minutes change
  React.useEffect(() => {
    setWorkTime(formatTime(workHours, workMinutes));
  }, [workHours, workMinutes]);

  React.useEffect(() => {
    setTotalTime(formatTime(totalHours, totalMinutes));
  }, [totalHours, totalMinutes]);

  // Update state when editing a different recipe
  React.useEffect(() => {
    if (editingRecipe) {
      setTitle(editingRecipe.title ?? '');
      const workTimeParsed = parseTime(editingRecipe.workTime ?? '');
      setWorkHours(workTimeParsed.hours);
      setWorkMinutes(workTimeParsed.minutes);
      const totalTimeParsed = parseTime(editingRecipe.totalTime ?? '');
      setTotalHours(totalTimeParsed.hours);
      setTotalMinutes(totalTimeParsed.minutes);
      setServings(editingRecipe.servings ? String(editingRecipe.servings) : '');
      setImageUrl(editingRecipe.imageUrl ?? '');
      setTags(editingRecipe.tags ?? []);
      setTips(editingRecipe.tips ?? '');
      setIngredients(editingRecipe.ingredients ?? []);
      setInstructions(editingRecipe.instructions ?? []);
    }
  }, [editingRecipe?.id]);

  // Format time input as HH:MM
  const formatTimeInput = (text: string): string => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length === 3) return `${cleaned.slice(0, 1)}:${cleaned.slice(1)}`;
    if (cleaned.length === 4) return `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
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
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!canSave) return;

    // Format times - note: UI is RTL so minutes come first visually, but format is HH:MM
    const formattedWorkTime = formatTime(workHours, workMinutes);
    const formattedTotalTime = formatTime(totalHours, totalMinutes);

    const recipe: Recipe = {
      id: editingRecipe?.id ?? Date.now(),
      title: title.trim(),
      ingredients,
      instructions,
      workTime: formattedWorkTime || undefined,
      totalTime: formattedTotalTime || undefined,
      servings: servings.trim() ? Number(servings) : undefined,
      imageUrl: imageUrl.trim() || '',
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
    setWorkHours('');
    setWorkMinutes('');
    setTotalHours('');
    setTotalMinutes('');
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        <Text style={styles.label}>שם המתכון *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="לדוגמה: עוגת שוקולד"
          style={styles.input}
          textAlign="right"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>זמן עבודה</Text>
            <View style={styles.timeRow}>
              <TextInput
                value={workMinutes}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, '').slice(0, 2);
                  if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 59)) {
                    setWorkMinutes(num);
                  }
                }}
                placeholder="00"
                style={styles.timeInput}
                textAlign="center"
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                value={workHours}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, '').slice(0, 2);
                  setWorkHours(num);
                }}
                placeholder="00"
                style={styles.timeInput}
                textAlign="center"
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>זמן הכנה כולל</Text>
            <View style={styles.timeRow}>
              <TextInput
                value={totalMinutes}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, '').slice(0, 2);
                  if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 59)) {
                    setTotalMinutes(num);
                  }
                }}
                placeholder="00"
                style={styles.timeInput}
                textAlign="center"
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                value={totalHours}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, '').slice(0, 2);
                  setTotalHours(num);
                }}
                placeholder="00"
                style={styles.timeInput}
                textAlign="center"
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
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
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
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
          onFocus={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
        />

        <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: { padding: 16, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { flex: 1, fontSize: 16, fontWeight: '900', color: '#111827', textAlign: 'right' },
  btnText: { fontWeight: '800', color: '#111827' },
  content: { padding: 16, gap: 10 },
  label: { textAlign: 'right', fontWeight: '800', color: '#111827', marginTop: 0 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  imageRow: { flexDirection: 'row-reverse', gap: 10, alignItems: 'center' },
  removeImageText: { fontWeight: '800', color: '#EF4444', fontSize: 12 },
  textarea: { minHeight: 110, paddingTop: 12 },
  row: { flexDirection: 'row-reverse', gap: 10 },
  col: { flex: 1 },
  timeRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start', gap: 4, marginTop: 8 },
  timeInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 10, color: '#111827', width: 50, fontSize: 16 },
  timeColon: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  preview: { width: '100%', height: 180, borderRadius: 14, backgroundColor: '#E5E7EB', marginTop: 8 },
  sectionTitle: { textAlign: 'right', fontWeight: '900', color: '#111827', fontSize: 14, marginTop: 10 },
});
