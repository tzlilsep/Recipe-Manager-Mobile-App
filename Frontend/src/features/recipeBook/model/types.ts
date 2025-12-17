// English comments only.

// Tags must match recipe_label enum in database (001_init.sql)
export const AVAILABLE_TAGS = [
  'קינוח',
  'עוף',
  'בשר',
  'דגים',
  'טבעוני',
  'צמחוני',
  'מרק',
  'מאפה',
  'אפייה',
  'סלט',
  'מנה ראשונה',
  'מנה עיקרית',
  'תוספת',
  'חגיגי',
] as const;

export type InstructionItem =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string };

export interface Ingredient {
  name: string;
  amount?: string;
  unit?: string;
  groupTitle?: string;
}

export interface Recipe {
  id: number | string;  // Backend uses UUID (string), but we support both
  title: string;
  ingredients: Ingredient[];
  instructions: InstructionItem[];
  workTime?: string;
  totalTime?: string;
  servings?: number;
  imageUrl: string;
  author?: string;
  tags?: string[];
  copiedFrom?: string;
  saveCount?: number;
  tips?: string;
}

export interface Meal {
  id: number;
  name: string;
  imageUrl?: string;
  recipeIds: (number | string)[];  // Support both number and string IDs
}

export interface ShoppingListData {
  id: number;
  name: string;
  items: any[];
}
