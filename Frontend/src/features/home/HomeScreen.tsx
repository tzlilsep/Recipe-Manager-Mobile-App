// src/features/home/HomeScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome Home! 🎉</Text>
      <Button title="Log out" onPress={() => alert('Logout pressed')} />
    </View>
  );
}
