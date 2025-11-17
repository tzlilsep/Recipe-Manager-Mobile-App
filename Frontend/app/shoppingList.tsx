// app\shoppingList.tsx
import { router } from 'expo-router';
import { ShoppingListScreen } from '../src/features/shoppingList';

export default function ShoppingListRoute() {
  return <ShoppingListScreen onBack={() => router.back()} />;
}
