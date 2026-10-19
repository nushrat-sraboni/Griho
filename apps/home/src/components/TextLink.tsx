// apps/home/src/components/TextLink.tsx
//
// A plain line of words that acts like a button, for moving between screens
// (for example "New here? Make an account") or for a quiet action. It is teal,
// or red when `danger` is set (for "Delete code"). It is at least 48 tall so it
// is easy to tap. Owned by Bishal.

import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../theme';

type Props = { label: string; onPress: () => void; danger?: boolean };

export default function TextLink({ label, onPress, danger = false }: Props) {
  return (
    <Pressable style={styles.link} onPress={onPress} accessibilityRole="link">
      <Text style={[styles.text, danger && styles.danger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  text: { fontFamily: fonts.bold, fontSize: 15, color: colors.teal },
  danger: { color: colors.errorText },
});
