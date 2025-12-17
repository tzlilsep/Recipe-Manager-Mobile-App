// English comments only.

import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../../components/ui/button';
import { RecipeBookTab } from '../../model/useRecipeBook';

type TabItem = { key: RecipeBookTab; label: string };

const TABS: TabItem[] = [
  { key: 'addEdit', label: 'הוספת מתכון' },
  { key: 'my', label: 'המתכונים שלי' },
  { key: 'others', label: 'חפש מתכונים' },
  { key: 'meals', label: 'ארוחות' },
  { key: 'useful', label: 'מידע שימושי' },
];

interface Props {
  safeTop: number;
  onBack: () => void;
  activeTab: RecipeBookTab;
  onChangeTab: (tab: RecipeBookTab) => void;
}

export function TabsBar({ safeTop, onBack, activeTab, onChangeTab }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  // Scroll to the right edge on mount (RTL - shows rightmost tabs first)
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>ספר מתכונים</Text>
        <Button variant="outline" onPress={onBack}>
          <Text style={styles.backText}>חזרה</Text>
        </Button>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        directionalLockEnabled
      >
        {TABS.map(t => {
          const isActive = t.key === activeTab;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => onChangeTab(t.key)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  backText: { color: '#111827', fontWeight: '600' },
  tabsRow: { flexDirection: 'row-reverse', gap: 10 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tabActive: { backgroundColor: '#111827', borderColor: '#111827' },
  tabText: { color: '#111827', fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF' },
});
