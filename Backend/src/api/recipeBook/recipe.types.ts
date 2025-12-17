// Backend/src/api/recipeBook/recipe.types.ts

import { RecipeLabel, IngredientUnit, RecipeStepType, RecipeIngredientRowType } from '../../engine/recipeBook/recipe.types';

// Request body for creating a recipe
export type CreateRecipeRequest = {
  name: string;
  prepMinutes?: number;
  totalMinutes?: number;
  servings?: number;
  imageUrl?: string;
  tips?: string;
  labels?: RecipeLabel[];
  ingredientRows?: IngredientRowInput[];
  steps?: RecipeStepInput[];
};

// Request body for updating a recipe
export type UpdateRecipeRequest = {
  name?: string;
  prepMinutes?: number;
  totalMinutes?: number;
  servings?: number;
  imageUrl?: string;
  tips?: string;
  labels?: RecipeLabel[];
  ingredientRows?: IngredientRowInput[];
  steps?: RecipeStepInput[];
};

// Ingredient row input (without id and recipeId)
export type IngredientRowInput = {
  position: number;
  rowType: RecipeIngredientRowType;
  
  // For group title rows
  title?: string;
  
  // For ingredient rows
  name?: string;
  quantity?: number;
  unit?: IngredientUnit;
  groupTitle?: string;
};

// Recipe step input (without id and recipeId)
export type RecipeStepInput = {
  position: number;
  stepType: RecipeStepType;
  textContent?: string;
  imageUrl?: string;
};

// Response format for recipe
export type RecipeResponse = {
  id: string;
  ownerUserId: string;
  name: string;
  prepMinutes?: number;
  totalMinutes?: number;
  servings?: number;
  imageUrl?: string;
  tips?: string;
  createdAt: string;
  updatedAt: string;
  labels: RecipeLabel[];
  ingredientRows: IngredientRowResponse[];
  steps: RecipeStepResponse[];
  isSaved?: boolean;
};

// Response format for ingredient row
export type IngredientRowResponse = {
  id: string;
  recipeId: string;
  position: number;
  rowType: RecipeIngredientRowType;
  title?: string;
  name?: string;
  quantity?: number;
  unit?: IngredientUnit;
  groupTitle?: string;
};

// Response format for recipe step
export type RecipeStepResponse = {
  id: string;
  recipeId: string;
  position: number;
  stepType: RecipeStepType;
  textContent?: string;
  imageUrl?: string;
};
