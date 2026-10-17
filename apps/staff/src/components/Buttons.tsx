// apps/staff/src/components/Buttons.tsx
//
// The two button styles of Griho Staff, taken from the design:
//   - PrimaryButton: solid deep green with white text and an arrow. The main action.
//   - OutlineButton: a thin outline with matching text. For quieter actions like
//     "Log out". Give it tone="danger" for risky ones like "Leave this building".
// Owned by Sraboni.

import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../styles';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  danger,
}: ButtonProps & { danger?: boolean }) {
  return (
    <Pressable
      style={[
        local.primary,
        danger && { backgroundColor: colors.danger },
        disabled && local.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={local.primaryText}>{danger ? label : `${label}  →`}</Text>
    </Pressable>
  );
}

export function OutlineButton({
  label,
  onPress,
  disabled,
  tone = 'green',
}: ButtonProps & { tone?: 'green' | 'danger' }) {
  const color = tone === 'danger' ? colors.danger : colors.green;
  return (
    <Pressable
      style={[local.outline, { borderColor: color }, disabled && local.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={[local.outlineText, { color }]}>{label}</Text>
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
  disabled: { opacity: 0.5 },
});
