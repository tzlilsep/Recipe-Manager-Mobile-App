// English comments only.
// API service for Recipe Book - handles REST calls to backend

import { Recipe, Meal } from '../model/types';
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
    return await apiRequest<GetRecipesResponse>('/recipes/my', {
      method: 'GET',
    });
  } catch (error) {
    console.error('fetchMyRecipes error:', error);
    return { ok: false, recipes: [] };
  }
}

export async function fetchOthersRecipes(): Promise<GetRecipesResponse> {
  try {
    return await apiRequest<GetRecipesResponse>('/recipes/others', {
      method: 'GET',
    });
  } catch (error) {
    console.error('fetchOthersRecipes error:', error);
    return { ok: false, recipes: [] };
  }
}

export async function fetchRecipeById(id: number): Promise<GetRecipeByIdResponse> {
  try {
    return await apiRequest<GetRecipeByIdResponse>(`/recipes/${id}`, {
      method: 'GET',
    });
  } catch (error) {
    console.error('fetchRecipeById error:', error);
    return { ok: false, error: 'Failed to fetch recipe' };
  }
}

export async function createRecipe(data: CreateRecipeRequest): Promise<CreateRecipeResponse> {
  try {
    return await apiRequest<CreateRecipeResponse>('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createRecipe error:', error);
    return { ok: false, error: 'Failed to create recipe' };
  }
}

export async function updateRecipe(data: UpdateRecipeRequest): Promise<UpdateRecipeResponse> {
  try {
    return await apiRequest<UpdateRecipeResponse>(`/recipes/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('updateRecipe error:', error);
    return { ok: false, error: 'Failed to update recipe' };
  }
}

export async function deleteRecipe(id: number): Promise<DeleteRecipeResponse> {
  try {
    return await apiRequest<DeleteRecipeResponse>(`/recipes/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteRecipe error:', error);
    return { ok: false, error: 'Failed to delete recipe' };
  }
}

export async function copyRecipeToMy(id: number): Promise<CreateRecipeResponse> {
  try {
    return await apiRequest<CreateRecipeResponse>(`/recipes/${id}/copy`, {
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
    return await apiRequest<GetMealsResponse>('/meals', {
      method: 'GET',
    });
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

export async function removeRecipeFromMeal(mealId: number, recipeId: number): Promise<AddRecipeToMealResponse> {
  try {
    return await apiRequest<AddRecipeToMealResponse>(`/meals/${mealId}/recipes/${recipeId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('removeRecipeFromMeal error:', error);
    return { ok: false, error: 'Failed to remove recipe from meal' };
  }
}
