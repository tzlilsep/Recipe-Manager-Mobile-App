// Frontend/src/features/shoppingList/ui/lists/components/ListCard.tsx
import React, { useRef, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Edit2, MoreVertical, ShoppingBasket } from 'lucide-react-native';
import { styles } from '../styles';
import { Button } from '../../../../../components/ui/button';
import { ShoppingItem, ShoppingListData } from '../../../model/domain/shopping.types';
import { previewItems } from '../../../model/domain/selectors';
import { SharedBadge } from './SharedBadge';
import { OverflowMenu } from './OverflowMenu';

type Props = {
  item: ShoppingListData;
  safeTop: number;
  deletingId: number | null;
  onOpenList: (id: number) => void;
  onDeleteSmart: (id: number) => void;
  onOpenShareDialog: (id: number) => void;
};

export const ListCard = ({
  item,
  safeTop,
  deletingId,
  onOpenList,
  onDeleteSmart,
  onOpenShareDialog,
}: Props) => {
  const menuBtnRef = useRef<View | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDeleting = deletingId === item.id;
const rawIsOwner: boolean = !!(item as any)?.isOwner;
const derivedIsShared =
  !!item.isShared || (Array.isArray(item.sharedWith) && item.sharedWith.length > 0);

const isOwner = rawIsOwner;
const canShare = isOwner && !derivedIsShared;
const deleteLabel = derivedIsShared && !isOwner ? 'הסר עבורי' : 'מחיקה';

  const subtitle =
    item.items.length === 0
      ? 'רשימה ריקה'
      : `${item.items.length} פריטים • ${item.items.filter(i => i.checked).length} הושלמו`;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onOpenList(item.id)}
      onLongPress={() => setMenuOpen(true)}
      style={styles.card}
    >
      {/* Header: title + status on the same row */}
      <View
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={styles.titleRow}>
          <ShoppingBasket size={20} />
          <Text style={[styles.title, { marginRight: 8 }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        <Text style={[styles.subtitle]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <SharedBadge item={item} />

      {/* Items preview */}
      {item.items.length > 0 && (
        <View style={{ marginTop: 8 }}>
          {previewItems(item, 3).map((sub: ShoppingItem, iidx: number) => (
            <Text
              key={Number.isFinite(sub.id) ? String(sub.id) : `item:${sub.name}:${iidx}`}
              style={[
                styles.itemText,
                { textAlign: 'right' },
                sub.checked ? styles.itemChecked : undefined,
                iidx > 0 && { marginTop: 4 },
              ]}
            >
              • {sub.name}
            </Text>
          ))}

          {item.items.length > 3 && (
            <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'right', marginTop: 4 }}>
              ועוד {item.items.length - 3} פריטים...
            </Text>
          )}
        </View>
      )}

      {/* Footer actions */}
      <View style={[styles.row, { marginTop: 12 }]}>
        <Button variant="outline" onPress={() => onOpenList(item.id)} style={{ flex: 1 }}>
          <Edit2 size={16} style={{ marginLeft: 8 }} />
          <Text>פתח</Text>
        </Button>

        <TouchableOpacity
          ref={(el) => (menuBtnRef.current = el as any)}
          onPress={() => {
            const ref = menuBtnRef.current as any;
            if (ref?.measureInWindow) {
              ref.measureInWindow((x: number, y: number, w: number, h: number) => {
                setMenuAnchor({ x: x + w, y: y + h });
                setMenuOpen(true);
              });
            } else {
              setMenuAnchor(null);
              setMenuOpen(true);
            }
          }}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="אפשרויות נוספות"
        >
          <MoreVertical size={18} />
        </TouchableOpacity>
      </View>

      <OverflowMenu
        visible={menuOpen}
        anchor={menuAnchor}
        safeTop={safeTop}
        onClose={() => setMenuOpen(false)}
        onSharePress={() => {
          // Close the menu first to avoid stacking multiple modals.
          setMenuOpen(false);
          // Defer opening the share dialog to the next frame so the menu fully unmounts.
          requestAnimationFrame(() => onOpenShareDialog(item.id));
        }}
        onDeletePress={() => onDeleteSmart(item.id)}
        isDeleting={isDeleting}
        canShare={canShare}
        deleteLabel={deleteLabel}
      />
    </TouchableOpacity>
  );
};
