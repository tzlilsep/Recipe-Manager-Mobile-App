// app/recipeBook.tsx
import { router } from 'expo-router';
import { RecipeBookScreen } from '../src/features/recipeBook';

export default function RecipesRoute() {
  return (
    <RecipeBookScreen onBack={() => router.back} />    
  );
}
