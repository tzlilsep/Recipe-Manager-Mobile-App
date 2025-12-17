// English comments only.

import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../../components/ui/button';
import { Recipe } from '../../model/types';
import { RecipeCard } from '../components';

interface Props {
  title: string;
  recipes: Recipe[];
  onOpenRecipe: (id: number) => void;
  onOpenFilters: () => void;
  filtersBadgeCount: number;
  showPopularToggle: boolean;
}

export function RecipeListScreen({
  title,
  recipes,
  onOpenRecipe,
  onOpenFilters,
  filtersBadgeCount,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Button variant="outline" onPress={onOpenFilters}>
          <Text style={styles.filterText}>
            סינון{filtersBadgeCount > 0 ? ` (${filtersBadgeCount})` : ''}
          </Text>
        </Button>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>לא נמצאו מתכונים התואמים את הסינון</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => onOpenRecipe(item.id)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { textAlign: 'right', fontSize: 16, fontWeight: '800', color: '#111827' },
  filterText: { fontWeight: '700', color: '#111827' },
  list: { gap: 12, paddingBottom: 24 },
  row: { gap: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#6B7280', textAlign: 'center' },
});
