// English comments only.

import React, { useMemo, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../../components/ui/button';
import { Ingredient, Recipe } from '../../model/types';
import { formatIngredientDisplay, scaleIngredientAmount } from '../../model/ingredientFormatter';

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
  const [imageHeight, setImageHeight] = useState<number>(250);

  const ratio = useMemo(() => {
    if (!recipe.servings) return 1;
    return servings / recipe.servings;
  }, [servings, recipe.servings]);

  const adjustedIngredients = useMemo(() => {
    return recipe.ingredients.map(ing => {
      if (!ing.amount) return ing;
      const scaledAmount = scaleIngredientAmount(ing.amount, ratio, ing.unit);
      return { ...ing, amount: scaledAmount };
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
        
        <View style={styles.actionButtons}>
          <Button 
            variant="outline" 
            onPress={() => onOpenAddToShopping(adjustedIngredients)}
          >
            <Text style={styles.cartIcon}>🛒</Text>
          </Button>
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
        {recipe.imageUrl && recipe.imageUrl.trim() ? (
          <Image 
            source={{ uri: recipe.imageUrl }} 
            style={[styles.hero, { height: imageHeight }]} 
            resizeMode="cover"
            onLoad={(e) => {
              const { width, height } = e.nativeEvent.source;
              const screenWidth = Dimensions.get('window').width - 32; // minus padding
              const calculatedHeight = (height / width) * screenWidth;
              setImageHeight(Math.min(calculatedHeight, 500));
            }}
          />
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.title} numberOfLines={1}>{recipe.title}</Text>
          {recipe.author ? <Text style={styles.metaText}>מאת: {recipe.author}</Text> : null}
          {recipe.workTime ? <Text style={styles.metaText}>זמן עבודה: {recipe.workTime}</Text> : null}
          {recipe.totalTime ? <Text style={styles.metaText}>זמן הכנה כולל: {recipe.totalTime}</Text> : null}

          {recipe.copiedFrom ? <Text style={styles.metaText}>מועתק מ-{recipe.copiedFrom}</Text> : null}
        </View>

        {recipe.servings ? (
          <View style={styles.servingsRow}>
            <Text style={styles.servingsText}>מספר מנות: {servings}</Text>
            <Button variant="outline" onPress={() => setServings(s => Math.max(1, s - 1))} style={styles.servingButton}><Text style={styles.servingButtonText}>-</Text></Button>
            <Button variant="outline" onPress={() => setServings(s => s + 1)} style={styles.servingButton}><Text style={styles.servingButtonText}>+</Text></Button>
            <Button variant="outline" onPress={() => setServings(recipe.servings ?? 1)} style={styles.servingButton}><Text style={styles.servingButtonText}>↺</Text></Button>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>מצרכים</Text>

        <View style={styles.box}>
          {grouped.general.map((ing, idx) => (
            <Text key={`g-${idx}`} style={styles.item}>
              {formatIngredientDisplay(ing)}
            </Text>
          ))}

          {Object.entries(grouped.groups).map(([title, list]) => (
            <View key={title} style={{ marginTop: 10 }}>
              <Text style={styles.groupTitle}>{title}</Text>
              {list.map((ing, idx) => (
                <Text key={`${title}-${idx}`} style={styles.item}>
                  {formatIngredientDisplay(ing)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {recipe.tips ? (
          <>
            <Text style={styles.sectionTitle}>טיפים והמלצות</Text>
            <View style={styles.tipsBox}>
              <Text style={styles.tipsText}>{recipe.tips}</Text>
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>הוראות הכנה</Text>
        <View style={styles.box}>
          {(() => {
            let stepNumber = 0;
            return recipe.instructions.map((step, idx) => {
              if (step.type === 'image') {
                return step.url && step.url.trim() ? (
                  <Image key={`img-${idx}`} source={{ uri: step.url }} style={styles.stepImage} />
                ) : null;
              }
              stepNumber++;
              return (
                <Text key={`txt-${idx}`} style={styles.item}>
                  {stepNumber}. {step.content}
                </Text>
              );
            });
          })()}
        </View>

        {recipe.tags && recipe.tags.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>תוויות</Text>
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: { padding: 12, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { flex: 1, fontSize: 22, fontWeight: '900', color: '#111827', textAlign: 'right' },
  btnText: { fontWeight: '800', color: '#111827' },
  cartIcon: { fontSize: 20 },
  actionButtons: { flexDirection: 'row-reverse', gap: 8 },
  deleteText: { fontWeight: '800', color: '#EF4444' },
  content: { padding: 16, paddingTop: 2, gap: 12, paddingBottom: 24 },
  hero: { width: '100%', backgroundColor: '#E5E7EB', marginBottom: 0 },
  metaRow: { gap: 4 },
  metaText: { textAlign: 'right', color: '#6B7280', fontSize: 16 },
  servingsRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  servingsText: { fontWeight: '600', color: '#111827', fontSize: 20 },
  servingButton: { minWidth: 38, minHeight: 38, paddingHorizontal: 0, justifyContent: 'center', alignItems: 'center' },
  servingButtonText: { fontSize: 18 },
  sectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionTitle: { textAlign: 'right', fontWeight: '900', color: '#bb6f66ff', fontSize: 20, marginBottom: 0 },
  box: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, paddingTop: 8, gap: 12 },
  item: { textAlign: 'right', color: '#111827', fontSize: 20, marginBottom: 20 },
  groupTitle: { textAlign: 'right', fontWeight: '900', color: '#000000ff', marginBottom: 12, fontSize: 18 },
  stepImage: { width: '100%', height: 180, borderRadius: 14, backgroundColor: '#E5E7EB' },
  tipsBox: { backgroundColor: '#FFFBEB', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#FDE68A' },
  tipsText: { textAlign: 'right', color: '#111827' },
  tagsContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#E0E7FF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: '#3730A3', fontWeight: '600', fontSize: 14 },
});
