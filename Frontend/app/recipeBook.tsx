// app/recipeBook.tsx
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { RecipeBookScreen } from '../src/features/recipeBook';

export default function RecipesRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />
      <RecipeBookScreen onBack={() => router.push('/home')} />
    </>
  );
}
