// app/shoppingList.tsx
import { Stack } from 'expo-router';
import 'react-native-gesture-handler';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ShoppingListScreen } from '../src/features/shoppingList';

export default function ShoppingListRoute() {
  return (
    <>
      {/* 👇 מוסיפים Stack עם gestureEnabled: false */}
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ShoppingListScreen onBack={() => router.back()} />
      </GestureHandlerRootView>
    </>
  );
}
