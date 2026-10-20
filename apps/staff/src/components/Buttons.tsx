// apps/staff/src/components/Buttons.tsx
//
// The two button styles of Griho Staff, taken from the design:
//   - PrimaryButton: solid deep green with white text and an arrow. The main action.
//     Give it danger for risky actions (solid red, no arrow).
//   - OutlineButton: a thin outline with matching text. For quieter actions like
//     "Log out". Give it tone="danger" for risky ones like "Leave this building".
// Both can be compact: shorter and without the extra space above, for use inside
// lists and rows (like Approve / Reject). Owned by Sraboni.

import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../styles';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shorter, with no extra space above, for use inside lists. */
  compact?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  danger,
  compact,
}: ButtonProps & { danger?: boolean }) {
  return (
    <Pressable
      style={[
        local.primary,
        compact && local.compact,
        danger && { backgroundColor: colors.danger },
        disabled && local.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={[local.primaryText, compact && local.compactText]}>
        {danger || compact ? label : `${label}  →`}
      </Text>
    </Pressable>
  );
}

export function OutlineButton({
  label,
  onPress,
  disabled,
  compact,
  tone = 'green',
}: ButtonProps & { tone?: 'green' | 'danger' }) {
  const color = tone === 'danger' ? colors.danger : colors.green;
  return (
    <Pressable
      style={[
        local.outline,
        compact && local.compact,
        { borderColor: compact ? (tone === 'danger' ? '#e6cfcc' : '#d8dfd9') : color },
        disabled && local.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={[local.outlineText, compact && local.compactText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const local = StyleSheet.create({
  primary: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  primaryText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  outline: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  outlineText: { fontSize: 16, fontWeight: '700' },
  // The shorter version for lists: 44 tall, smaller corners, no space above.
  compact: { height: 44, borderRadius: 12, marginTop: 0 },
  compactText: { fontSize: 14 },
  disabled: { opacity: 0.5 },
});
