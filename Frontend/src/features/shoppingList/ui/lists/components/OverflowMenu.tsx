// Frontend/src/features/shoppingList/ui/lists/components/OverflowMenu.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Share2, Trash2, ArrowUp, ArrowDown } from 'lucide-react-native';
import { styles } from '../styles';

type Props = {
  visible: boolean;
  anchor: { x: number; y: number } | null;
  onClose: () => void;
  onSharePress: () => void;
  onDeletePress: () => void;
  onMoveUpPress: () => void;
  onMoveDownPress: () => void;
  isDeleting: boolean;
  canShare: boolean;
  deleteLabel: string;
  safeTop: number;
};

export const OverflowMenu = ({
  visible,
  anchor,
  onClose,
  onSharePress,
  onDeletePress,
  onMoveUpPress,
  onMoveDownPress,
  isDeleting,
  canShare,
  deleteLabel,
  safeTop,
}: Props) => {
  const H = Dimensions.get('window').height;

  const MENU_WIDTH = 180;
  const MENU_HEIGHT = 110;
  const verticalOffset = 3;
  const horizontalOffset = 180;

  const calcTop = () => {
    if (!anchor) return (safeTop || 0) + 8;
    const desired = anchor.y + verticalOffset;
    const minTop = (safeTop || 0) + 8;
    const maxTop = H - MENU_HEIGHT - 8;
    return Math.min(maxTop, Math.max(minTop, desired));
  };

  const calcLeft = () => {
    if (!anchor) return 8;
    const desired = anchor.x - horizontalOffset;
    return Math.max(8, desired);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.menuModalOverlay}>
        <TouchableOpacity style={{ position: 'absolute', inset: 0 } as any} onPress={onClose} />
        {anchor && (
          <View style={[styles.menu, { top: calcTop(), left: calcLeft(), width: MENU_WIDTH }]}>
            <TouchableOpacity
              style={[styles.menuItem, !canShare && { opacity: 0.5 }]}
              onPress={canShare ? onSharePress : undefined}
              disabled={!canShare}
            >
              <Share2 size={16} style={{ marginLeft: 8 }} />
              <Text style={styles.menuText}>
                {canShare ? 'שיתוף רשימה' : 'שיתוף זמין לבעלים בלבד'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onMoveUpPress();
                onClose();
              }}
            >
              <ArrowUp size={16} style={{ marginLeft: 8 }} />
              <Text style={styles.menuText}>הזז למעלה</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onMoveDownPress();
                onClose();
              }}
            >
              <ArrowDown size={16} style={{ marginLeft: 8 }} />
              <Text style={styles.menuText}>הזז למטה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onDeletePress} disabled={isDeleting}>
              <Trash2 size={16} color={isDeleting ? '#9CA3AF' : '#ef4444'} style={{ marginLeft: 8 }} />
              <Text style={[styles.menuText, { color: isDeleting ? '#9CA3AF' : '#ef4444' }]}>
                {isDeleting ? 'מבצע…' : deleteLabel}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};
