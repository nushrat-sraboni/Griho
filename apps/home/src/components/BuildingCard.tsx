// apps/home/src/components/BuildingCard.tsx
//
// One building in the "My buildings" list: its name, a role label such as
// "Owner" or "Tenant · Flat 4B", and an "Active" label on the one that is open
// right now. The whole card can be tapped to open that building.
// Owned by Bishal.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { MembershipWithLastOwner } from '../api';
import { roleLabel } from '../buildings';
import { cardStyle, colors, fonts } from '../theme';
import Pill from './Pill';

type Props = {
  membership: MembershipWithLastOwner;
  active: boolean;
  onPress: () => void;
};

export default function BuildingCard({ membership, active, onPress }: Props) {
  const roleText = roleLabel(membership);
  const isOwner = membership.role === 'owner';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${membership.building.name}, ${roleText}${active ? ', active' : ''}`}
      style={[styles.card, active && styles.cardActive]}
    >
      <View style={[styles.icon, isOwner ? styles.iconOwner : styles.iconOther]}>
        <View style={[styles.window, isOwner ? styles.windowOwner : styles.windowOtherDark]} />
        <View style={[styles.window, isOwner ? styles.windowLit : styles.windowOtherLight]} />
        <View style={[styles.window, isOwner ? styles.windowOwner : styles.windowOtherLight]} />
        <View style={[styles.window, isOwner ? styles.windowOwner : styles.windowOtherDark]} />
      </View>
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {membership.building.name}
        </Text>
        <View style={styles.pills}>
          <Pill text={roleText} />
          {active ? <Pill text="Active" tone="amber" /> : null}
        </View>
      </View>
      <Svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.teal}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M9 6 L15 12 L9 18" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyle,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardActive: { borderColor: colors.teal, borderWidth: 1.5 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: 9,
  },
  iconOwner: { backgroundColor: colors.teal },
  iconOther: { backgroundColor: colors.windowOff },
  window: { width: 11, height: 11, borderRadius: 3 },
  windowOwner: { backgroundColor: colors.page },
  windowLit: { backgroundColor: colors.amber },
  windowOtherDark: { backgroundColor: colors.teal },
  windowOtherLight: { backgroundColor: colors.white },
  middle: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink, letterSpacing: -0.2 },
  pills: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
