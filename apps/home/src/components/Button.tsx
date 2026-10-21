// apps/home/src/components/Button.tsx
//
// The buttons of Griho Home.
//   primary : solid teal (the main action on a form)
//   outline : teal outline (a quieter action, like Log out)
//   light   : white (sits on a teal card)
//   ghost   : see-through white outline (second action on a teal card)
// "compact" makes a smaller button for use inside cards. "arrow" adds a small
// arrow after the words. While `busy` is true the button shows `busyLabel` and
// cannot be pressed again. Owned by Bishal.

import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../theme';

type Variant = 'primary' | 'outline' | 'light' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  /** 'danger' is solid red, for things that cannot be undone (delete, leave, remove). */
  variant?: Variant;
  compact?: boolean;
  arrow?: boolean;
  busy?: boolean;
  busyLabel?: string;
  /** A greyed-out button that cannot be pressed (for example until a name is typed). */
  disabled?: boolean;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  compact = false,
  arrow = false,
  busy = false,
  busyLabel,
  disabled = false,
}: Props) {
  const text = busy && busyLabel ? busyLabel : label;
  const off = busy || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy }}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.regular,
        variantStyles[variant],
        (pressed || busy) && styles.dimmed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, compact && styles.compactText, textStyles[variant]]}>
        {text}
        {arrow && !busy ? '  →' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  regular: { height: 52, borderRadius: 14, paddingHorizontal: 20 },
  compact: { height: 44, borderRadius: 12, paddingHorizontal: 16 },
  dimmed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  text: { fontFamily: fonts.bold, fontSize: 16 },
  compactText: { fontSize: 13.5 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.teal },
  outline: { borderWidth: 1.5, borderColor: colors.teal },
  light: { backgroundColor: colors.white },
  danger: { backgroundColor: colors.danger },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
});

const textStyles = StyleSheet.create({
  primary: { color: colors.white },
  outline: { color: colors.teal },
  light: { color: colors.teal },
  danger: { color: colors.white },
  ghost: { color: colors.white },
});
