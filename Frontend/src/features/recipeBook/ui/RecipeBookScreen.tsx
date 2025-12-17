// English comments only.

import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
        onBack={onBack}
        activeTab={vm.activeTab}
        onChangeTab={vm.setActiveTab}
      />

      {(vm.activeTab === 'my' || vm.activeTab === 'others') && (
        <RecipeListScreen
          title={vm.activeTab === 'my' ? 'המתכונים שלי' : 'חפש מתכונים'}
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
          editingRecipe={vm.editingRecipe}
          onSave={(recipe: Recipe) => {
            if (vm.editingRecipe) vm.updateMyRecipe(recipe);
            else vm.addMyRecipe(recipe);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
});
