// English comments only.

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRecipeBook } from '../model/useRecipeBook';
import { ShoppingListData, Ingredient, Recipe } from '../model/types';
import { TabsBar, RecipeFiltersModal, AddToShoppingListModal } from './components';
import { RecipeListScreen, RecipeDetailsScreen, AddEditRecipeScreen, MealsScreen, UsefulInfoScreen } from './screens';

interface Props {
  onBack: () => void;
  shoppingLists?: ShoppingListData[];
  onAddToShoppingList?: (listId: number, ingredients: Array<{ name: string; amount?: string; unit?: string }>) => void;
}

export function RecipeBookScreen({ onBack, shoppingLists = [], onAddToShoppingList = () => {} }: Props) {
  const { top } = useSafeAreaInsets();
  const safeTop = top && top > 0 ? top : 44;
  
  const vm = useRecipeBook();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
  const [shoppingIngredients, setShoppingIngredients] = useState<Ingredient[]>([]);

  const isOthers = vm.activeTab === 'others';

  const listData = useMemo(() => {
    if (vm.activeTab === 'my') return vm.filteredMyRecipes;
    if (vm.activeTab === 'others') return vm.filteredOthersRecipes;
    return [];
  }, [vm.activeTab, vm.filteredMyRecipes, vm.filteredOthersRecipes]);

  // Details screen
  if (vm.selectedRecipe) {
    return (
      <SafeAreaView style={styles.screen} edges={['top','left','right']}>
        <RecipeDetailsScreen
          recipe={vm.selectedRecipe}
          onBack={vm.closeRecipe}
          onEdit={!vm.selectedRecipe.author ? () => vm.startEditRecipe(vm.selectedRecipe!) : undefined}
          onDelete={!vm.selectedRecipe.author ? () => {
            vm.deleteMyRecipe(vm.selectedRecipe!.id);
            vm.closeRecipe();
          } : undefined}
          onCopy={vm.selectedRecipe.author ? () => vm.copyToMyRecipes(vm.selectedRecipe!) : undefined}
          onOpenAddToShopping={(ingredients: Ingredient[]) => {
            setShoppingIngredients(ingredients);
            setShoppingModalOpen(true);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top','left','right']}>
      <TabsBar
        safeTop={safeTop}
        activeTab={vm.activeTab}
        onChangeTab={vm.setActiveTab}
      />

      {(vm.activeTab === 'my' || vm.activeTab === 'others') && (
        <RecipeListScreen
          title={''}
          recipes={listData}
          onOpenRecipe={vm.openRecipe}
          onOpenFilters={() => setFiltersOpen(true)}
          showPopularToggle={isOthers}
          filtersBadgeCount={
            (vm.filters.searchText ? 1 : 0) +
            (vm.filters.maxTimeMinutes > 0 ? 1 : 0) +
            vm.filters.selectedTags.length +
            vm.filters.selectedIngredients.length +
            (isOthers && vm.filters.showPopularOnly ? 1 : 0)
          }
        />
      )}

      {vm.activeTab === 'addEdit' && (
        <AddEditRecipeScreen
          key={vm.editingRecipe?.id ?? 'new'}
          editingRecipe={vm.editingRecipe}
          onSave={(recipe: Recipe) => {
            if (vm.editingRecipe) vm.updateMyRecipe(recipe);
            else vm.addMyRecipe(recipe);
            vm.clearEditingRecipe();
            vm.setActiveTab('my');
          }}
        />
      )}

      {vm.activeTab === 'meals' && (
        <MealsScreen
          meals={vm.meals}
          allRecipes={vm.allRecipes}
          getMealRecipes={vm.getMealRecipes}
          onAddMeal={vm.addMeal}
          onDeleteMeal={vm.deleteMeal}
          onAddRecipeToMeal={vm.addRecipeToMeal}
          onRemoveRecipeFromMeal={vm.removeRecipeFromMeal}
          onOpenRecipe={vm.openRecipe}
          onAddMealToShopping={(ingredients: Ingredient[]) => {
            setShoppingIngredients(ingredients);
            setShoppingModalOpen(true);
          }}
        />
      )}

      {vm.activeTab === 'useful' && <UsefulInfoScreen />}

      <RecipeFiltersModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        availableIngredients={vm.getAllIngredients(vm.activeTab === 'my' ? vm.myRecipes : vm.allRecipes)}
        showPopularToggle={isOthers}
        state={vm.filters}
        onChange={vm.setFilters}
        onReset={() => vm.setFilters({
          searchText: '',
          maxTimeMinutes: 0,
          selectedTags: [],
          selectedIngredients: [],
          showPopularOnly: false,
        })}
      />

      <AddToShoppingListModal
        visible={shoppingModalOpen}
        onClose={() => setShoppingModalOpen(false)}
        shoppingLists={shoppingLists}
        ingredients={shoppingIngredients}
        onSubmit={(listId: number, ingredients: Ingredient[]) => {
          onAddToShoppingList(listId, ingredients);
          setShoppingModalOpen(false);
        }}
      />

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={20} color="#bb6f66ff" style={{ marginLeft: 6 }} />
        <Text style={styles.backButtonText}>חזור</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ecd7c2ff' },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#bb6f66ff',
    fontWeight: '600',
    fontSize: 16,
  },
});