// src/features/home/ui/HomeHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { Button } from '../../../../components/ui/button';

interface Props {
  username: string;
  onLogout: () => void;
}

export function HomeHeader({ username, onLogout }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>שלום, {username}!</Text>
      <Button variant="outline" onPress={onLogout}>
        <LogOut color="#111827" size={18} />
        <Text style={styles.logoutText}>התנתק</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  logoutText: {
    marginRight: 6,
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
  },
});
