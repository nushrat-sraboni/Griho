// apps/home/src/components/FlatRow.tsx
//
// One flat in the Flats list: a tile with the flat's name, a label saying who
// owns it ("You own it", "Owned by Salma" or "No owner"), and the one button
// that makes sense for it: Rename on my own flats, Claim on flats with no owner,
// nothing on another owner's flat. Owned by Bishal.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Flat } from '@griho/shared';

import {
  canClaimFlat,
  canRenameFlat,
  flatOwnerText,
  flatOwnerTone,
  type OwnerTone,
} from '../flats';
import { colors, fonts } from '../theme';
import Pill from './Pill';

type Props = {
  flat: Flat;
  myAccountId: string;
  onRename: () => void;
  onClaim: () => void;
};

const TILE: Record<OwnerTone, { background: string; text: string }> = {
  mine: { background: colors.pillTeal, text: colors.pillTealText },
  other: { background: colors.pillGrey, text: colors.pillGreyText },
  none: { background: colors.pillAmber, text: colors.pillAmberText },
};

const PILL_TONE = { mine: 'teal', other: 'grey', none: 'amber' } as const;

export default function FlatRow({ flat, myAccountId, onRename, onClaim }: Props) {
  const tone = flatOwnerTone(flat, myAccountId);
  const tile = TILE[tone];

  return (
    <View style={styles.row}>
      <View
        style={[styles.tile, { backgroundColor: tile.background }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text
          style={[styles.tileText, { color: tile.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {flat.label}
        </Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          Flat {flat.label}
        </Text>
        <View style={styles.pill}>
          <Pill text={flatOwnerText(flat, myAccountId)} tone={PILL_TONE[tone]} />
        </View>
      </View>
      {canRenameFlat(flat, myAccountId) ? (
        <Pressable
          style={styles.rename}
          onPress={onRename}
          accessibilityRole="button"
          accessibilityLabel={`Rename flat ${flat.label}`}
        >
          <Text style={styles.renameText}>Rename</Text>
        </Pressable>
      ) : null}
      {canClaimFlat(flat) ? (
        <Pressable
          style={styles.claim}
          onPress={onClaim}
          accessibilityRole="button"
          accessibilityLabel={`Claim flat ${flat.label}`}
        >
          <Text style={styles.claimText}>Claim</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  tile: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tileText: { fontFamily: fonts.extraBold, fontSize: 16 },
  middle: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  pill: { marginTop: 4, alignSelf: 'flex-start' },
  rename: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  renameText: { fontFamily: fonts.bold, fontSize: 14, color: colors.teal },
  claim: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.teal,
    justifyContent: 'center',
  },
  claimText: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.white },
});
