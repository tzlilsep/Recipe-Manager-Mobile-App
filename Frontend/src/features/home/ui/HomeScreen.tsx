// src/features/home/ui/HomeScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeProps } from '../model/home.types';
import { HomeHeader } from './components/HomeHeader';
import { HomeGrid } from './components/HomeGrid';
import { useAuth } from '../../auth/model/auth.context';

export function HomeScreen({ onNavigate, onLogout }: HomeProps) {
  const { auth } = useAuth();

  // Build username locally (display logic)
  const username = (auth.userName ?? '').trim() || 'אורח';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.container}>
        <HomeHeader username={username} onLogout={onLogout} />
        <HomeGrid onNavigate={onNavigate} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ecd7c2ff',
  },
  container: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
});
