// English comments only.

import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../../components/ui/button';
import { Ingredient, Recipe } from '../../model/types';

interface Props {
  recipe: Recipe;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onOpenAddToShopping: (ingredients: Ingredient[]) => void;
}

export function RecipeDetailsScreen({ recipe, onBack, onEdit, onDelete, onCopy, onOpenAddToShopping }: Props) {
  const [servings, setServings] = useState<number>(recipe.servings ?? 1);

  const ratio = useMemo(() => {
    if (!recipe.servings) return 1;
    return servings / recipe.servings;
  }, [servings, recipe.servings]);

  const adjustedIngredients = useMemo(() => {
    return recipe.ingredients.map(ing => {
      const n = Number(ing.amount);
      if (!ing.amount || Number.isNaN(n)) return ing;
      const v = (n * ratio).toFixed(1).replace(/\.0$/, '');
      return { ...ing, amount: v };
    });
  }, [recipe.ingredients, ratio]);

  // Group ingredients by groupTitle
  const grouped = useMemo(() => {
    const general = adjustedIngredients.filter(i => !i.groupTitle);
    const groups: Record<string, Ingredient[]> = {};
    adjustedIngredients.filter(i => i.groupTitle).forEach(i => {
      const k = i.groupTitle!;
      if (!groups[k]) groups[k] = [];
      groups[k].push(i);
    });
    return { general, groups };
  }, [adjustedIngredients]);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Button variant="outline" onPress={onBack}><Text style={styles.btnText}>חזור</Text></Button>
        <Text style={styles.title} numberOfLines={1}>{recipe.title}</Text>
        <View style={styles.actionButtons}>
          {onEdit ? (
            <Button variant="outline" onPress={onEdit}><Text style={styles.btnText}>עריכה</Text></Button>
          ) : onCopy ? (
            <Button variant="outline" onPress={onCopy}><Text style={styles.btnText}>שמור</Text></Button>
          ) : null}
          {onDelete ? (
            <Button variant="outline" onPress={onDelete}><Text style={styles.deleteText}>מחק</Text></Button>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: recipe.imageUrl }} style={styles.hero} />

        <View style={styles.metaRow}>
          {recipe.totalTime ? <Text style={styles.metaText}>סה"כ {recipe.totalTime}</Text> : null}
          {recipe.workTime ? <Text style={styles.metaText}>עבודה {recipe.workTime}</Text> : null}
          {recipe.author ? <Text style={styles.metaText}>מאת: {recipe.author}</Text> : null}
          {recipe.copiedFrom ? <Text style={styles.metaText}>מועתק מ-{recipe.copiedFrom}</Text> : null}
        </View>

        {recipe.servings ? (
          <View style={styles.servingsRow}>
            <Button variant="outline" onPress={() => setServings(s => Math.max(1, s - 1))}><Text>-</Text></Button>
            <Text style={styles.servingsText}>מנות: {servings}</Text>
            <Button variant="outline" onPress={() => setServings(s => s + 1)}><Text>+</Text></Button>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>מצרכים</Text>
          <Button
            variant="outline"
            onPress={() => onOpenAddToShopping(adjustedIngredients)}
          >
            <Text style={styles.btnText}>הוסף לרשימת קניות</Text>
          </Button>
        </View>

        <View style={styles.box}>
          {grouped.general.map((ing, idx) => (
            <Text key={`g-${idx}`} style={styles.item}>
              {ing.name}{ing.amount ? ` - ${ing.amount}` : ''}{ing.unit ? ` ${ing.unit}` : ''}
            </Text>
          ))}

          {Object.entries(grouped.groups).map(([title, list]) => (
            <View key={title} style={{ marginTop: 10 }}>
              <Text style={styles.groupTitle}>{title}</Text>
              {list.map((ing, idx) => (
                <Text key={`${title}-${idx}`} style={styles.item}>
                  {ing.name}{ing.amount ? ` - ${ing.amount}` : ''}{ing.unit ? ` ${ing.unit}` : ''}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>הוראות הכנה</Text>
        <View style={styles.box}>
          letCount
          {recipe.instructions.map((step, idx) => {
            if (step.type === 'image') {
              return <Image key={`img-${idx}`} source={{ uri: step.url }} style={styles.stepImage} />;
            }
            return (
              <Text key={`txt-${idx}`} style={styles.item}>
                {idx + 1}. {step.content}
              </Text>
            );
          })}
        </View>

        {recipe.tips ? (
          <>
            <Text style={styles.sectionTitle}>טיפים והמלצות</Text>
            <View style={styles.tipsBox}>
              <Text style={styles.tipsText}>{recipe.tips}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: { padding: 16, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { flex: 1, fontSize: 16, fontWeight: '900', color: '#111827', textAlign: 'right' },
  btnText: { fontWeight: '800', color: '#111827' },  actionButtons: { flexDirection: 'row-reverse', gap: 8 },
  deleteText: { fontWeight: '800', color: '#EF4444' },  content: { padding: 16, gap: 12, paddingBottom: 24 },
  hero: { width: '100%', height: 220, borderRadius: 14, backgroundColor: '#E5E7EB' },
  metaRow: { gap: 4 },
  metaText: { textAlign: 'right', color: '#6B7280' },
  servingsRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  servingsText: { fontWeight: '800', color: '#111827' },
  sectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionTitle: { textAlign: 'right', fontWeight: '900', color: '#111827', fontSize: 14 },
  box: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, gap: 8 },
  item: { textAlign: 'right', color: '#111827' },
  groupTitle: { textAlign: 'right', fontWeight: '900', color: '#1D4ED8', marginBottom: 6 },
  stepImage: { width: '100%', height: 180, borderRadius: 14, backgroundColor: '#E5E7EB' },
  tipsBox: { backgroundColor: '#FFFBEB', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#FDE68A' },
  tipsText: { textAlign: 'right', color: '#111827' },
});
