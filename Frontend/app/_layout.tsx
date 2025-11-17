// app/_layout.tsx
import { Stack } from 'expo-router';                    
import { SafeAreaProvider } from 'react-native-safe-area-context';      // Ensures layout respects device safe areas
import { AuthProvider } from '../src/features/auth/model/auth.context'; // Provides global authentication state and actions
import { GestureHandlerRootView } from 'react-native-gesture-handler';  // Enables advanced gesture handling across the app

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#ecd7c2ff' },
              gestureEnabled: false,
            }}
          />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
