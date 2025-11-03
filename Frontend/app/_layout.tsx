// app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/features/auth/model/auth.context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#EEF2FF' },
            gestureEnabled: false, 
          }}
        />
        <StatusBar style="dark" backgroundColor="#EEF2FF" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
