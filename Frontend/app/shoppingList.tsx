// app/shoppingList.tsx
import { router } from 'expo-router';
import { ShoppingListScreen } from '../src/features/shoppingList';

export default function ShoppingRoute() {
  return <ShoppingListScreen onBack={() => router.push('/home')} />;
}
