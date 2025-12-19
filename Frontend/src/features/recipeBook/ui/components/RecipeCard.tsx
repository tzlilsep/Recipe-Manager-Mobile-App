// English comments only.

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../../model/types';

interface Props {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      {recipe.saveCount !== undefined && recipe.saveCount > 0 ? (
        <View style={styles.saveBadge}>
          <Ionicons name="bookmark" size={14} color="#FFF" />
          <Text style={styles.saveCount}>{recipe.saveCount}</Text>
        </View>
      ) : null}
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
        <View style={styles.timesRow}>
          {recipe.workTime ? (
            <Text style={styles.meta}>{recipe.workTime} 👨‍🍳</Text>
          ) : null}
          {recipe.totalTime ? (
            <Text style={styles.meta}>{recipe.totalTime} 🕐</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F3F4F6', minHeight: 220 },
  image: { width: '100%', height: 220 },
  saveBadge: { 
    position: 'absolute', 
    top: 6, 
    left: 6, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    paddingHorizontal: 3, 
    paddingVertical: 4, 
    borderRadius: 8,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  saveCount: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)' },
  title: { color: '#FFF', fontWeight: '700', textAlign: 'right', fontSize: 15 },
  timesRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 3 },
  meta: { color: 'rgba(255,255,255,0.95)', textAlign: 'right', fontSize: 14, fontWeight: '600' },
});
