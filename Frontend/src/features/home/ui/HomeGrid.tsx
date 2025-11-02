// src/features/home/ui/HomeGrid.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShoppingCart, BookOpen, Sprout } from 'lucide-react-native';
import { FeatureCard } from './FeatureCard';
import { LockedFeatureCard } from './LockedFeatureCard';
import { HomeNavPage } from '../model/home.types';

interface Props {
  onNavigate: (page: HomeNavPage) => void;
}

export function HomeGrid({ onNavigate }: Props) {
  return (
    <View style={styles.grid}>
      <View style={styles.col}>
        <FeatureCard
          icon={<BookOpen color="#16A34A" size={48} />}
          title="ספר מתכונים"
          subtitle="שמור ונהל את המתכונים שלך"
          bgColor="#D1FAE5"
          onPress={() => onNavigate('recipes')}
        />
      </View>

      <View style={styles.col}>
        <FeatureCard
          icon={<ShoppingCart color="#2563EB" size={48} />}
          title="רשימת קניות"
          subtitle="נהל את רשימת הקניות שלך"
          bgColor="#DBEAFE"
          onPress={() => onNavigate('shopping')}
        />
      </View>

      <View style={styles.col}>
        <LockedFeatureCard
          icon={<Sprout color="#6B7280" size={48} />}
          title="Planty"
          subtitle="בקרוב..."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12, // אם gap לא נתמך בגרסה שלך, נחליף במרווחים ידניים
  },
  col: {
    flexBasis: '100%', // אפשר לשנות בעתיד ל-50%/33% למסכים רחבים
  },
});
