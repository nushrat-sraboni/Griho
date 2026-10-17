// apps/home/src/components/Pill.tsx
//
// A small rounded label such as "Owner", "Tenant · Flat 4B", "Active" or
// "Soon". The tone sets its colors: teal for roles, amber for "Active", grey
// for things that are not ready yet. Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

type Tone = 'teal' | 'amber' | 'grey';

type Props = { text: string; tone?: Tone };

const LOOK: Record<Tone, { background: string; text: string }> = {
  teal: { background: colors.pillTeal, text: colors.pillTealText },
  amber: { background: colors.pillAmber, text: colors.pillAmberText },
  grey: { background: colors.pillGrey, text: colors.pillGreyText },
};

export default function Pill({ text, tone = 'teal' }: Props) {
  const look = LOOK[tone];
  return (
    <View style={[styles.pill, { backgroundColor: look.background }]}>
      <Text style={[styles.text, { color: look.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999 },
  text: { fontFamily: fonts.bold, fontSize: 12 },
});
