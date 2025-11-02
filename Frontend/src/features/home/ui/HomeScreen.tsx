// src/features/home/ui/HomeScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeProps } from '../model/home.types';
import { HomeHeader } from './HomeHeader';
import { HomeGrid } from './HomeGrid';

export function HomeScreen({ username, onNavigate, onLogout }: HomeProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <HomeHeader username={username} onLogout={onLogout} />
        <HomeGrid onNavigate={onNavigate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF2FF', // במקום gradient
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
});
