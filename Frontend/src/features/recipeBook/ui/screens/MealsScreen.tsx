// English comments only.

import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../../components/ui/button';
import { Ingredient, Meal, Recipe } from '../../model/types';
import { MealEditorModal, AddRecipeToMealModal } from '../components';

interface Props {
  meals: Meal[];
  allRecipes: Recipe[];
  getMealRecipes: (meal: Meal) => Recipe[];

  onAddMeal: (name: string, imageUrl?: string) => void;
  onDeleteMeal: (mealId: number) => void;

  onAddRecipeToMeal: (mealId: number, recipeId: number | string) => void;
  onRemoveRecipeFromMeal: (mealId: number, recipeId: number | string) => void;

  onOpenRecipe: (id: number | string) => void;

  onAddMealToShopping: (ingredients: Ingredient[]) => void;
}

export function MealsScreen({
  meals,
  allRecipes,
  getMealRecipes,
  onAddMeal,
  onDeleteMeal,
  onAddRecipeToMeal,
  onRemoveRecipeFromMeal,
  onOpenRecipe,
  onAddMealToShopping,
}: Props) {
  const [addMealOpen, setAddMealOpen] = useState(false);

  const [addRecipeOpen, setAddRecipeOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<number | null>(null);

  const activeMeal = useMemo(() => meals.find(m => m.id === activeMealId) ?? null, [meals, activeMealId]);

  return (
    <View style={styles.container}>
      <Button onPress={() => setAddMealOpen(true)}>
        <Text style={styles.primaryText}>הוסף ארוחה חדשה</Text>
      </Button>

      {meals.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>עדיין אין ארוחות. הוסף ארוחה ראשונה.</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, gap: 12 }}
          renderItem={({ item }) => {
            const recipes = getMealRecipes(item);
            const ingredients: Ingredient[] = recipes.flatMap(r => r.ingredients);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Button variant="outline" onPress={() => onDeleteMeal(item.id)}>
                    <Text style={styles.btnText}>מחק</Text>
                  </Button>

                  <Text style={styles.mealTitle}>{item.name}</Text>

                  <Button
                    variant="outline"
                    onPress={() => {
                      setActiveMealId(item.id);
                      setAddRecipeOpen(true);
                    }}
                  >
                    <Text style={styles.btnText}>הוסף מתכון</Text>
                  </Button>
                </View>

                <View style={styles.cardActions}>
                  <Button
                    variant="outline"
                    onPress={() => onAddMealToShopping(ingredients)}
                    disabled={ingredients.length === 0}
                  >
                    <Text style={styles.btnText}>הוסף לרשימת קניות ({ingredients.length})</Text>
                  </Button>
                </View>

                {recipes.length === 0 ? (
                  <Text style={styles.muted}>
                    עדיין אין מתכונים בארוחה זו.
                  </Text>
                ) : (
                  <View style={styles.recipesGrid}>
                    {recipes.map(r => (
                      <View key={r.id} style={styles.recipeMini}>
                        <Button variant="outline" onPress={() => onOpenRecipe(r.id)}>
                          <Text style={styles.btnText}>{r.title}</Text>
                        </Button>
                        <Button
                          variant="outline"
                          onPress={() => onRemoveRecipeFromMeal(item.id, r.id)}
                        >
                          <Text style={styles.btnText}>הסר</Text>
                        </Button>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      <MealEditorModal
        visible={addMealOpen}
        onClose={() => setAddMealOpen(false)}
        onSubmit={(name: string, imageUrl?: string) => {
          onAddMeal(name, imageUrl);
          setAddMealOpen(false);
        }}
      />

      <AddRecipeToMealModal
        visible={addRecipeOpen}
        onClose={() => setAddRecipeOpen(false)}
        meal={activeMeal}
        recipes={allRecipes}
        onPickRecipe={(recipeId: number | string) => {
          if (!activeMeal) return;
          onAddRecipeToMeal(activeMeal.id, recipeId);
          setAddRecipeOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#FFFFFF' },
  primaryText: { fontWeight: '900', color: '#FFFFFF' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#6B7280', textAlign: 'center' },

  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 12, gap: 10 },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  mealTitle: { flex: 1, textAlign: 'right', fontWeight: '900', color: '#111827' },
  btnText: { fontWeight: '800', color: '#111827' },
  cardActions: { alignItems: 'flex-end' },
  muted: { color: '#6B7280', textAlign: 'right' },

  recipesGrid: { gap: 8 },
  recipeMini: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 10 },
});
