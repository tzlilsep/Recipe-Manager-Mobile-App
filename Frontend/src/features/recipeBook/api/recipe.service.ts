// English comments only.
// API service for Recipe Book - handles REST calls to backend

import { Recipe, Meal, Ingredient, InstructionItem } from '../model/types';
import { parseAmountToNumber } from '../model/ingredientFormatter';
import {
  GetRecipesResponse,
  GetRecipeByIdResponse,
  CreateRecipeRequest,
  CreateRecipeResponse,
  UpdateRecipeRequest,
  UpdateRecipeResponse,
  DeleteRecipeResponse,
  GetMealsResponse,
  CreateMealRequest,
  CreateMealResponse,
  AddRecipeToMealRequest,
  AddRecipeToMealResponse,
} from './recipe.api.types';

// Helper to parse time string - supports both "HH:MM" and legacy "15 דקות" formats
function parseTimeToMinutes(timeStr?: string): number | undefined {
  if (!timeStr) return undefined;
  
  // Check if it's HH:MM format
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(s => parseInt(s.trim(), 10));
    if (!isNaN(hours) && !isNaN(minutes)) {
      return hours * 60 + minutes;
    }
  }
  
  // Legacy format: "15 דקות"
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

// Helper to convert frontend Recipe format to backend CreateRecipeRequest
function mapRecipeToCreateRequest(recipe: Partial<Recipe>): any {
  const ingredientRows: any[] = [];
  let position = 0;

  // Group ingredients by groupTitle
  const grouped = new Map<string | undefined, Ingredient[]>();
  recipe.ingredients?.forEach(ing => {
    const group = ing.groupTitle || undefined;
    if (!grouped.has(group)) {
      grouped.set(group, []);
    }
    grouped.get(group)!.push(ing);
  });

  // Build ingredientRows with group titles
  grouped.forEach((ings, groupTitle) => {
    if (groupTitle) {
      ingredientRows.push({
        position: position++,
        rowType: 'כותרת',
        title: groupTitle,
      });
    }
    ings.forEach(ing => {
      const numericAmount = ing.amount ? parseAmountToNumber(ing.amount) : undefined;
      ingredientRows.push({
        position: position++,
        rowType: 'מצרך',
        name: ing.name,
        quantity: numericAmount && numericAmount > 0 ? numericAmount : undefined,
        unit: ing.unit || undefined,
        groupTitle: groupTitle,
      });
    });
  });

  // Convert instructions to steps
  const steps = recipe.instructions?.map((inst, idx) => ({
    position: idx,
    stepType: inst.type as 'text' | 'image',
    textContent: inst.type === 'text' ? inst.content : undefined,
    imageUrl: inst.type === 'image' ? inst.url : undefined,
  })) || [];

  return {
    name: recipe.title,
    prepMinutes: parseTimeToMinutes(recipe.workTime),
    totalMinutes: parseTimeToMinutes(recipe.totalTime),
    servings: recipe.servings,
    imageUrl: recipe.imageUrl || '',
    tips: recipe.tips,
    labels: recipe.tags || [],
    ingredientRows,
    steps,
  };
}

// Helper to convert backend response to frontend Recipe format
function mapBackendToRecipe(backendRecipe: any): Recipe {
  // Convert ingredientRows back to ingredients
  const ingredients: Ingredient[] = [];
  backendRecipe.ingredientRows?.forEach((row: any) => {
    if (row.rowType === 'מצרך') {
      // Backend stores quantity as decimal number, convert to string for frontend
      const amountStr = row.quantity != null ? String(row.quantity) : '';
      ingredients.push({
        name: row.name || '',
        amount: amountStr,
        unit: row.unit || '',
        groupTitle: row.groupTitle,
      });
    }
  });

  // Convert steps back to instructions
  const instructions: InstructionItem[] = backendRecipe.steps?.map((step: any) => {
    if (step.stepType === 'text') {
      return { type: 'text', content: step.textContent || '' };
    } else {
      return { type: 'image', url: step.imageUrl || '' };
    }
  }) || [];

  // Helper function to convert minutes to HH:MM format
  const formatMinutesToTime = (minutes: number | null | undefined): string | undefined => {
    if (!minutes) return undefined;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Convert minutes back to HH:MM format
  const workTime = formatMinutesToTime(backendRecipe.prepMinutes);
  const totalTime = formatMinutesToTime(backendRecipe.totalMinutes);

  return {
    id: backendRecipe.id,
    title: backendRecipe.name,
    ingredients,
    instructions,
    workTime,
    totalTime,
    servings: backendRecipe.servings,
    imageUrl: backendRecipe.imageUrl || '',
    author: backendRecipe.ownerUsername || backendRecipe.ownerUserId,
    tags: backendRecipe.labels || [],
    tips: backendRecipe.tips,
    saveCount: backendRecipe.saveCount || 0,
  };
}

// TODO: Update this URL to match your backend server
const API_BASE_URL = 'http://192.168.1.51:5005/api';

// Helper function to get auth token from storage
async function getAuthToken(): Promise<string | null> {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const authData = await AsyncStorage.getItem('@auth');
    if (!authData) return null;
    const parsed = JSON.parse(authData);
    return parsed.token || null;
  } catch {
    return null;
  }
}

// Helper function for making authenticated requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============ Recipe APIs ============

export async function fetchMyRecipes(): Promise<GetRecipesResponse> {
  try {
    const response = await apiRequest<any>('/recipes', {
      method: 'GET',
    });
    
    if (response.ok && response.recipes) {
      const recipes = response.recipes.map(mapBackendToRecipe);
      return { ok: true, recipes };
    }
    
    return { ok: false, recipes: [] };
  } catch (error) {
    console.error('fetchMyRecipes error:', error);
    return { ok: false, recipes: [] };
  }
}

export async function fetchOthersRecipes(): Promise<GetRecipesResponse> {
  try {
    const response = await apiRequest<any>('/recipes/all', {
      method: 'GET',
    });
    
    if (response.ok && response.recipes) {
      const recipes = response.recipes.map(mapBackendToRecipe);
      return { ok: true, recipes };
    }
    
    return { ok: false, recipes: [] };
  } catch (error) {
    console.error('fetchOthersRecipes error:', error);
    return { ok: false, recipes: [] };
  }
}

export async function fetchRecipeById(id: number | string): Promise<GetRecipeByIdResponse> {
  try {
    const response = await apiRequest<any>(`/recipes/${id}`, {
      method: 'GET',
    });
    
    if (response.ok && response.recipe) {
      const recipe = mapBackendToRecipe(response.recipe);
      return { ok: true, recipe };
    }
    
    return { ok: false, error: 'Recipe not found' };
  } catch (error) {
    console.error('fetchRecipeById error:', error);
    return { ok: false, error: 'Failed to fetch recipe' };
  }
}

export async function createRecipe(data: CreateRecipeRequest): Promise<CreateRecipeResponse> {
  try {
    const backendData = mapRecipeToCreateRequest(data);
    const response = await apiRequest<any>('/recipes', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    
    if (response.ok && response.recipe) {
      const recipe = mapBackendToRecipe(response.recipe);
      return { ok: true, recipe };
    }
    
    return { ok: false, error: 'Failed to create recipe' };
  } catch (error) {
    console.error('createRecipe error:', error);
    return { ok: false, error: 'Failed to create recipe' };
  }
}

export async function updateRecipe(data: UpdateRecipeRequest): Promise<UpdateRecipeResponse> {
  try {
    const backendData = mapRecipeToCreateRequest(data);
    const response = await apiRequest<any>(`/recipes/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    
    if (response.ok && response.recipe) {
      const recipe = mapBackendToRecipe(response.recipe);
      return { ok: true, recipe };
    }
    
    return { ok: false, error: 'Failed to update recipe' };
  } catch (error) {
    console.error('updateRecipe error:', error);
    return { ok: false, error: 'Failed to update recipe' };
  }
}

export async function deleteRecipe(id: number | string): Promise<DeleteRecipeResponse> {
  try {
    return await apiRequest<DeleteRecipeResponse>(`/recipes/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteRecipe error:', error);
    return { ok: false, error: 'Failed to delete recipe' };
  }
}

export async function copyRecipeToMy(id: number | string): Promise<CreateRecipeResponse> {
  try {
    return await apiRequest<CreateRecipeResponse>(`/recipes/${id}/save`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('copyRecipeToMy error:', error);
    return { ok: false, error: 'Failed to copy recipe' };
  }
}

// ============ Meal APIs ============

export async function fetchMeals(): Promise<GetMealsResponse> {
  try {
    // TODO: Backend doesn't have meals endpoint yet
    // For now, return empty array
    return { ok: true, meals: [] };
  } catch (error) {
    console.error('fetchMeals error:', error);
    return { ok: false, meals: [] };
  }
}

export async function createMeal(data: CreateMealRequest): Promise<CreateMealResponse> {
  try {
    return await apiRequest<CreateMealResponse>('/meals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createMeal error:', error);
    return { ok: false, error: 'Failed to create meal' };
  }
}

export async function deleteMeal(id: number): Promise<DeleteRecipeResponse> {
  try {
    return await apiRequest<DeleteRecipeResponse>(`/meals/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteMeal error:', error);
    return { ok: false, error: 'Failed to delete meal' };
  }
}

export async function addRecipeToMeal(data: AddRecipeToMealRequest): Promise<AddRecipeToMealResponse> {
  try {
    return await apiRequest<AddRecipeToMealResponse>(`/meals/${data.mealId}/recipes`, {
      method: 'POST',
      body: JSON.stringify({ recipeId: data.recipeId }),
    });
  } catch (error) {
    console.error('addRecipeToMeal error:', error);
    return { ok: false, error: 'Failed to add recipe to meal' };
  }
}

export async function removeRecipeFromMeal(mealId: number, recipeId: number | string): Promise<AddRecipeToMealResponse> {
  try {
    return await apiRequest<AddRecipeToMealResponse>(`/meals/${mealId}/recipes/${recipeId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('removeRecipeFromMeal error:', error);
    return { ok: false, error: 'Failed to remove recipe from meal' };
  }
}
