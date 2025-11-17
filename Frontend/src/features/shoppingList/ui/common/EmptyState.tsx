import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = { icon?: ReactNode; text: string };

export function EmptyState({ icon, text }: Props) {
  return (
    <View style={[styles.center, { paddingVertical: 32 }]}>
      {icon}
      <Text style={{ color: '#6B7280', marginTop: 8 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
