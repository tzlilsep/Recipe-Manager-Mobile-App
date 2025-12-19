// English comments only.

import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
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
  activeTab: RecipeBookTab;
  onChangeTab: (tab: RecipeBookTab) => void;
  initialScrollToEnd?: boolean;
  onScrollX?: (x: number) => void;
  scrollX?: number;
}

export function TabsBar({ safeTop, activeTab, onChangeTab, initialScrollToEnd = true, onScrollX, scrollX }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  // Always show tabs bar
  const showTabsBar = true;

  // Scroll to the right edge only on first mount
  useEffect(() => {
    if (initialScrollToEnd) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [initialScrollToEnd]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        directionalLockEnabled
        onScroll={e => {
          onScrollX?.(e.nativeEvent.contentOffset.x);
        }}
        scrollEventThrottle={16}
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
  container: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabsRow: { flexDirection: 'row-reverse', gap: 10 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tabActive: { backgroundColor: '#e2857bff', borderColor: '#ffffffff' },
  tabText: { color: '#bb6f66ff', fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF' },
});
