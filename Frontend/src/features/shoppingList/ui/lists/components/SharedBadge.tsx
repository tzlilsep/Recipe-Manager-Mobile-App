// Frontend/src/features/shoppingList/ui/lists/components/SharedBadge.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Users } from 'lucide-react-native';
import { styles } from '../styles';
import type { ShoppingListData } from '../../../model/domain/shopping.types';

export const SharedBadge = ({ item }: { item: ShoppingListData }) => {
  // Derive sharing state defensively: show badge if either flag or partner exists.
  const derivedIsShared =
    !!item.isShared || (Array.isArray(item.sharedWith) && item.sharedWith.length > 0);

  if (!derivedIsShared) return null;

  // If owner: show all partner names from sharedWith
  // If shared with you: show owner name
  const isOwner = !!(item as any)?.isOwner;
  const ownerUsername = (item as any)?.ownerUsername;
  
  const partner = isOwner
    ? (Array.isArray(item.sharedWith) && item.sharedWith.length > 0
        ? item.sharedWith.join(', ')  // Show all partners separated by comma
        : 'משתמש אחר')
    : (ownerUsername || 'הבעלים');

  return (
    <View style={[styles.sharedRow, { alignSelf: 'flex-end', flexDirection: 'row-reverse' }]}>
      <Users size={14} color="#2563EB" />
      <Text style={[styles.sharedText, { marginRight: 4 }]}>
        משותפת עם {partner}
      </Text>
    </View>
  );
};
