// Frontend/src/features/shoppingList/ui/lists/components/ShareDialog.tsx
import React from 'react';
import { View, Text, Modal, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { styles } from '../styles';
import { Button } from '../../../../../components/ui/button';

type Props = {
  visible: boolean;
  identifier: string;
  error: string | null;
  isSharing: boolean;
  onChangeIdentifier: (v: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export const ShareDialog = ({
  visible,
  identifier,
  error,
  isSharing,
  onChangeIdentifier,
  onCancel,
  onSubmit,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>שיתוף רשימה</Text>
          <Text style={styles.modalSubtitle}>
            ניתן לשתף עם משתמש אחד בלבד, ורק אם את/ה יצרת את הרשימה.
          </Text>

          <TextInput
            value={identifier}
            onChangeText={onChangeIdentifier}
            placeholder="username"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            textAlign="right"
            editable={!isSharing}
          />

          {error ? (
            <Text style={{ color: '#ef4444', marginTop: 6, textAlign: 'right' }}>
              {error}
            </Text>
          ) : null}

          <View style={[styles.row, { marginTop: 12 }]}>
            <Button variant="outline" onPress={onCancel} style={{ flex: 1 }} disabled={isSharing}>
              <Text>בטל</Text>
            </Button>
            <View style={{ width: 12 }} />
            <Button onPress={onSubmit} style={{ flex: 1 }} disabled={!identifier.trim() || isSharing}>
              <Share2 size={16} style={{ marginLeft: 8 }} />
              <Text>{isSharing ? 'משתף…' : 'שתף'}</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
