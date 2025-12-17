// English comments only.

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Recipe } from '../../model/types';

interface Props {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
        <View style={styles.timesRow}>
          {recipe.workTime ? (
            <Text style={styles.meta}>👨‍🍳 {recipe.workTime}</Text>
          ) : null}
          {recipe.totalTime ? (
            <Text style={styles.meta}>🕐 {recipe.totalTime}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F3F4F6', minHeight: 220 },
  image: { width: '100%', height: 220 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)' },
  title: { color: '#FFF', fontWeight: '700', textAlign: 'right', fontSize: 15 },
  timesRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 3 },
  meta: { color: 'rgba(255,255,255,0.95)', textAlign: 'right', fontSize: 11, fontWeight: '600' },
});
