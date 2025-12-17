// English comments only.

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
  id: number;
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
  recipeIds: number[];
}

export interface ShoppingListData {
  id: number;
  name: string;
  items: any[];
}
