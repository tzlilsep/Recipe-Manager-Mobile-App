// src/components/ui/button.tsx

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  StyleProp,
} from 'react-native';

type Variant = 'default' | 'outline';
type Size = 'default' | 'icon';

export interface ButtonProps {
  variant?: Variant;
  size?: Size;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  onPress,
  disabled,
  children,
  style,
}) => {
  const isOutline = variant === 'outline';
  const isIcon = size === 'icon';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        isOutline ? styles.outline : styles.default,
        isIcon ? styles.icon : styles.defaultSize,
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {/* אם children הוא טקסט רגיל—לעטוף ב-<Text> */}
      {typeof children === 'string' ? (
        <Text style={[styles.text, isOutline && styles.textDark]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    gap: 6,
  },
  default: {
    backgroundColor: '#6366F1',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  defaultSize: {
    height: 40,
    paddingHorizontal: 16,
  },
  icon: {
    height: 40,
    width: 40,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textDark: {
    color: '#111827',
  },
});
