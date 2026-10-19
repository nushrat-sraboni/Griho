// apps/home/src/components/CodeCard.tsx
//
// One join code in the "Your codes" list: what kind of code it is, whether it is
// Active, Turned off or Used up, the code itself in big letters, and how many
// uses are left. The whole card can be tapped to open the code. Owned by Bishal.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CodeInfo } from '@griho/shared';

import { codeStatus, codeTypeLabel, usesLeftText, type CodeStatusTone } from '../codes';
import { colors, fonts } from '../theme';
import Pill, { type PillTone } from './Pill';

type Props = { code: CodeInfo; onPress: () => void };

const STATUS_TONE: Record<CodeStatusTone, PillTone> = {
  active: 'green',
  off: 'grey',
  usedUp: 'amber',
};

export default function CodeCard({ code, onPress }: Props) {
  const status = codeStatus(code);
  const dimmed = status.tone === 'off';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${codeTypeLabel(code)} ${code.value}, ${status.text}, ${usesLeftText(code)}`}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Pill text={codeTypeLabel(code)} />
        <Pill text={status.text} tone={STATUS_TONE[status.tone]} />
      </View>
      <Text
        style={[styles.value, dimmed && styles.valueDimmed]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {code.value}
      </Text>
      <Text style={styles.uses}>{usesLeftText(code)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  value: {
    marginTop: 10,
    fontFamily: fonts.extraBold,
    fontSize: 22,
    letterSpacing: 1.6,
    color: colors.ink,
  },
  valueDimmed: { color: colors.muted },
  uses: { marginTop: 6, fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
});
