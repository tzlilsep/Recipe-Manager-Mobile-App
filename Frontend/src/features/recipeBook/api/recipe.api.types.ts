// English comments only.
// API types for Recipe Book feature

import { Recipe, Meal, Ingredient } from '../model/types';

// Request/Response types for API calls

export interface GetRecipesResponse {
  ok: boolean;
  recipes: Recipe[];
}

export interface GetRecipeByIdResponse {
  ok: boolean;
  recipe?: Recipe;
  error?: string;
}

export interface CreateRecipeRequest {
  title: string;
  ingredients: Ingredient[];
  instructions: any[];
  workTime?: string;
  totalTime?: string;
  servings?: number;
  imageUrl: string;
  tags?: string[];
  tips?: string;
}

export interface CreateRecipeResponse {
  ok: boolean;
  recipe?: Recipe;
  error?: string;
}

export interface UpdateRecipeRequest extends CreateRecipeRequest {
  id: number;
}

export interface UpdateRecipeResponse {
  ok: boolean;
  recipe?: Recipe;
  error?: string;
}

export interface DeleteRecipeResponse {
  ok: boolean;
  error?: string;
}

export interface GetMealsResponse {
  ok: boolean;
  meals: Meal[];
}

export interface CreateMealRequest {
  name: string;
  imageUrl?: string;
}

export interface CreateMealResponse {
  ok: boolean;
  meal?: Meal;
  error?: string;
}

export interface AddRecipeToMealRequest {
  mealId: number;
  recipeId: number;
}

export interface AddRecipeToMealResponse {
  ok: boolean;
  error?: string;
}
