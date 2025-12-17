// Backend/src/engine/recipeBook/recipe.types.ts

export type IngredientUnit =
  | 'יחידה'
  | 'גרם'
  | 'קילו'
  | 'כוס'
  | 'כף'
  | 'כפית'
  | 'ליטר'
  | 'מ״ל'
  | 'שיניים'
  | 'חבילה'
  | 'לפי הטעם'
  | 'ללא';

export type RecipeLabel =
  | 'קינוח'
  | 'עוף'
  | 'בשר'
  | 'דגים'
  | 'טבעוני'
  | 'צמחוני'
  | 'מרק'
  | 'מאפה'
  | 'אפייה'
  | 'סלט'
  | 'מנה ראשונה'
  | 'מנה עיקרית'
  | 'תוספת'
  | 'חגיגי';

export type RecipeStepType = 'text' | 'image';
export type RecipeIngredientRowType = 'כותרת' | 'מצרך';

// Ingredient row in a recipe (can be a group title or an ingredient)
export type RecipeIngredientRow = {
  id: string;
  recipeId: string;
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

// Recipe step (text or image)
export type RecipeStep = {
  id: string;
  recipeId: string;
  position: number;
  stepType: RecipeStepType;
  textContent?: string;
  imageUrl?: string;
};

// Main recipe entity
export type Recipe = {
  id: string;
  ownerUserId: string;
  name: string;
  prepMinutes?: number;
  totalMinutes?: number;
  servings?: number;
  imageUrl?: string;
  tips?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Full recipe with all related data
export type RecipeDetail = Recipe & {
  labels: RecipeLabel[];
  ingredientRows: RecipeIngredientRow[];
  steps: RecipeStep[];
  isSaved?: boolean; // Whether the current user saved this recipe
};

// Input for creating a recipe
export type CreateRecipeInput = {
  name: string;
  prepMinutes?: number;
  totalMinutes?: number;
  servings?: number;
  imageUrl?: string;
  tips?: string;
  labels?: RecipeLabel[];
  ingredientRows?: Omit<RecipeIngredientRow, 'id' | 'recipeId'>[];
  steps?: Omit<RecipeStep, 'id' | 'recipeId'>[];
};

// Input for updating a recipe
export type UpdateRecipeInput = {
  name?: string;
  prepMinutes?: number;
  totalMinutes?: number;
  servings?: number;
  imageUrl?: string;
  tips?: string;
  labels?: RecipeLabel[];
  ingredientRows?: Omit<RecipeIngredientRow, 'id' | 'recipeId'>[];
  steps?: Omit<RecipeStep, 'id' | 'recipeId'>[];
};
