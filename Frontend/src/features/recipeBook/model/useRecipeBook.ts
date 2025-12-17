// English comments only.

import { useMemo, useState, useEffect } from 'react';
import { clamp, parseTimeMinutes } from './utils';
import { Meal, Recipe } from './types';
import * as recipeApi from '../api/recipe.service';

export type RecipeBookTab = 'my' | 'others' | 'addEdit' | 'meals' | 'useful';

export interface RecipeFiltersState {
  searchText: string;
  maxTimeMinutes: number; // 0 = no limit
  selectedTags: string[];
  selectedIngredients: string[];
  showPopularOnly: boolean; // for others tab
}

const defaultFilters: RecipeFiltersState = {
  searchText: '',
  maxTimeMinutes: 0,
  selectedTags: [],
  selectedIngredients: [],
  showPopularOnly: false,
};

export function useRecipeBook() {
  const [activeTab, setActiveTab] = useState<RecipeBookTab>('my');

  // State - only DB data, no mock data
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [othersRecipes, setOthersRecipes] = useState<Recipe[]>([]);

  // Load recipes from API on mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const [myResult, othersResult] = await Promise.all([
          recipeApi.fetchMyRecipes(),
          recipeApi.fetchOthersRecipes(),
        ]);
        
        // Update state with DB data
        if (myResult.ok) {
          setMyRecipes(myResult.recipes);
        }
        if (othersResult.ok) {
          setOthersRecipes(othersResult.recipes);
        }
      } catch (error) {
        console.warn('Failed to load recipes from API', error);
        // Leave empty arrays on error
      }
    };

    loadRecipes();
  }, []);

  const [selectedRecipeId, setSelectedRecipeId] = useState<number | string | null>(null);
  const selectedRecipe = useMemo(() => {
    const all = [...myRecipes, ...othersRecipes];
    return all.find(r => r.id === selectedRecipeId) ?? null;
  }, [myRecipes, othersRecipes, selectedRecipeId]);

  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const [filters, setFilters] = useState<RecipeFiltersState>(defaultFilters);

  const [meals, setMeals] = useState<Meal[]>([]);

  // Load meals from API on mount
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const result = await recipeApi.fetchMeals();
        if (result.ok && result.meals.length > 0) {
          setMeals(result.meals);
        }
      } catch (error) {
        console.warn('Failed to load meals from API', error);
      }
    };

    loadMeals();
  }, []);

  const openRecipe = (id: number | string) => setSelectedRecipeId(id);
  const closeRecipe = () => setSelectedRecipeId(null);

  const startAddRecipe = () => {
    setEditingRecipe(null);
    setActiveTab('addEdit');
  };

  const startEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setSelectedRecipeId(null); // Close details screen before opening edit
    setActiveTab('addEdit');
  };

  const clearEditingRecipe = () => {
    setEditingRecipe(null);
  };

  const addMyRecipe = async (recipe: Recipe) => {
    try {
      const result = await recipeApi.createRecipe({
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        workTime: recipe.workTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        imageUrl: recipe.imageUrl,
        tags: recipe.tags,
        tips: recipe.tips,
      });

      if (result.ok && result.recipe) {
        setMyRecipes(prev => [result.recipe!, ...prev]);
      }
    } catch (error) {
      console.warn('Failed to create recipe on server', error);
    }
  };

  const updateMyRecipe = async (recipe: Recipe) => {
    try {
      const result = await recipeApi.updateRecipe({
        id: recipe.id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        workTime: recipe.workTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        imageUrl: recipe.imageUrl,
        tags: recipe.tags,
        tips: recipe.tips,
      });

      if (result.ok && result.recipe) {
        setMyRecipes(prev => prev.map(r => (r.id === result.recipe!.id ? result.recipe! : r)));
      }
    } catch (error) {
      console.warn('Failed to update recipe on server', error);
    }
  };

  const copyToMyRecipes = async (recipe: Recipe) => {
    try {
      const result = await recipeApi.copyRecipeToMy(recipe.id);

      if (result.ok && result.recipe) {
        setMyRecipes(prev => [result.recipe!, ...prev]);
      }
    } catch (error) {
      console.warn('Failed to copy recipe on server', error);
    }
  };

  const deleteMyRecipe = async (id: number | string) => {
    try {
      const result = await recipeApi.deleteRecipe(id);

      if (result.ok) {
        setMyRecipes(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.warn('Failed to delete recipe on server', error);
    }
    
    if (selectedRecipeId === id) setSelectedRecipeId(null);
  };

  const getAllIngredients = (recipes: Recipe[]) => {
    const s = new Set<string>();
    recipes.forEach(r => r.ingredients.forEach(i => s.add(i.name)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  };

  const applyFilters = (recipes: Recipe[], isOthers: boolean) => {
    return recipes.filter(r => {
      if (filters.searchText.trim()) {
        const q = filters.searchText.trim().toLowerCase();
        const titleMatch = r.title.toLowerCase().includes(q);
        const ingMatch = r.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!titleMatch && !ingMatch) return false;
      }

      if (filters.maxTimeMinutes > 0) {
        const t = parseTimeMinutes(r.totalTime);
        if (t > filters.maxTimeMinutes) return false;
      }

      if (filters.selectedIngredients.length > 0) {
        const names = r.ingredients.map(i => i.name);
        const ok = filters.selectedIngredients.every(x => names.includes(x));
        if (!ok) return false;
      }

      if (filters.selectedTags.length > 0) {
        const tags = r.tags ?? [];
        const ok = filters.selectedTags.every(t => tags.includes(t));
        if (!ok) return false;
      }

      if (isOthers && filters.showPopularOnly) {
        const c = r.saveCount ?? 0;
        if (c < 30) return false;
      }

      return true;
    });
  };

  const filteredMyRecipes = useMemo(() => applyFilters(myRecipes, false), [myRecipes, filters]);
  const filteredOthersRecipes = useMemo(() => applyFilters(othersRecipes, true), [othersRecipes, filters]);

  // Meals
  const addMeal = async (name: string, imageUrl?: string) => {
    try {
      const result = await recipeApi.createMeal({ name, imageUrl });

      if (result.ok && result.meal) {
        setMeals(prev => [result.meal!, ...prev]);
      } else {
        // Fallback to local state if API fails
        const meal: Meal = { id: Date.now(), name, imageUrl, recipeIds: [] };
        setMeals(prev => [meal, ...prev]);
      }
    } catch (error) {
      console.warn('Failed to create meal on server, adding locally', error);
      const meal: Meal = { id: Date.now(), name, imageUrl, recipeIds: [] };
      setMeals(prev => [meal, ...prev]);
    }
  };

  const deleteMeal = async (mealId: number) => {
    try {
      const result = await recipeApi.deleteMeal(mealId);

      if (result.ok) {
        setMeals(prev => prev.filter(m => m.id !== mealId));
      } else {
        // Fallback to local delete if API fails
        setMeals(prev => prev.filter(m => m.id !== mealId));
      }
    } catch (error) {
      console.warn('Failed to delete meal on server, deleting locally', error);
      setMeals(prev => prev.filter(m => m.id !== mealId));
    }
  };

  const addRecipeToMeal = async (mealId: number, recipeId: number | string) => {
    try {
      const result = await recipeApi.addRecipeToMeal({ mealId, recipeId });

      if (result.ok) {
        setMeals(prev => prev.map(m => {
          if (m.id !== mealId) return m;
          if (m.recipeIds.includes(recipeId)) return m;
          return { ...m, recipeIds: [...m.recipeIds, recipeId] };
        }));
      } else {
        // Fallback to local update if API fails
        setMeals(prev => prev.map(m => {
          if (m.id !== mealId) return m;
          if (m.recipeIds.includes(recipeId)) return m;
          return { ...m, recipeIds: [...m.recipeIds, recipeId] };
        }));
      }
    } catch (error) {
      console.warn('Failed to add recipe to meal on server, updating locally', error);
      setMeals(prev => prev.map(m => {
        if (m.id !== mealId) return m;
        if (m.recipeIds.includes(recipeId)) return m;
        return { ...m, recipeIds: [...m.recipeIds, recipeId] };
      }));
    }
  };

  const removeRecipeFromMeal = async (mealId: number, recipeId: number | string) => {
    try {
      const result = await recipeApi.removeRecipeFromMeal(mealId, recipeId);

      if (result.ok) {
        setMeals(prev => prev.map(m => {
          if (m.id !== mealId) return m;
          return { ...m, recipeIds: m.recipeIds.filter(id => id !== recipeId) };
        }));
      } else {
        // Fallback to local update if API fails
        setMeals(prev => prev.map(m => {
          if (m.id !== mealId) return m;
          return { ...m, recipeIds: m.recipeIds.filter(id => id !== recipeId) };
        }));
      }
    } catch (error) {
      console.warn('Failed to remove recipe from meal on server, updating locally', error);
      setMeals(prev => prev.map(m => {
        if (m.id !== mealId) return m;
        return { ...m, recipeIds: m.recipeIds.filter(id => id !== recipeId) };
      }));
    }
  };

  const allRecipes = useMemo(() => [...myRecipes, ...othersRecipes], [myRecipes, othersRecipes]);

  const getMealRecipes = (meal: Meal) =>
    meal.recipeIds.map(id => allRecipes.find(r => r.id === id)).filter(Boolean) as Recipe[];

  const bumpMaxTime = (minutes: number) => setFilters(prev => ({ ...prev, maxTimeMinutes: clamp(minutes, 0, 240) }));

  return {
    activeTab,
    setActiveTab,

    myRecipes,
    othersRecipes,
    filteredMyRecipes,
    filteredOthersRecipes,

    filters,
    setFilters,
    bumpMaxTime,
    getAllIngredients,

    selectedRecipe,
    editingRecipe,

    openRecipe,
    closeRecipe,

    startAddRecipe,
    startEditRecipe,
    clearEditingRecipe,

    addMyRecipe,
    updateMyRecipe,
    copyToMyRecipes,
    deleteMyRecipe,

    meals,
    addMeal,
    deleteMeal,
    addRecipeToMeal,
    removeRecipeFromMeal,
    getMealRecipes,

    allRecipes,
  };
}
