// src/features/home/ui/LockedFeatureCard.tsx
import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { Card, CardContent } from '../../../../components/ui/card';

interface Props {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function LockedFeatureCard({ icon, title, subtitle }: Props) {
  return (
    <Card style={styles.card}>
      <CardContent style={styles.content}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconBackground}>{icon}</View>
          <View style={styles.lockBadge}>
            <Lock color="white" size={14} />
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    opacity: 0.75,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  iconBackground: {
    backgroundColor: '#D1D5DB',
    padding: 12,
    borderRadius: 999,
  },
  lockBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#4B5563',
    padding: 4,
    borderRadius: 999,
  },
  title: {
    fontSize: 18,
    color: '#4B5563',
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});
