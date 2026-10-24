// apps/home/src/screens/SettingsScreen.tsx
//
// The Settings tab. It shows who is logged in (name and email), then the account
// actions: Log out and Delete my account. When a building is open it also shows
// that building (the building bar stays at the top, a product rule) and a red
// "Leave this building" link. Opened from "My buildings" (by tapping the round
// badge), there is no building, so only the account actions show.
// Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';
import type { Account } from '@griho/shared';

import type { MembershipWithLastOwner } from '../api';
import Avatar from '../components/Avatar';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Screen from '../components/Screen';
import TextLink from '../components/TextLink';
import { roleLabel } from '../buildings';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  account: Account;
  /** The open building, or null when opened from "My buildings". */
  membership: MembershipWithLastOwner | null;
  onBack: () => void;
  onSwitch: () => void;
  onLogOut: () => void;
  onDeleteAccount: () => void;
  onLeave: () => void;
};

export default function SettingsScreen({
  account,
  membership,
  onBack,
  onSwitch,
  onLogOut,
  onDeleteAccount,
  onLeave,
}: Props) {
  return (
    <Screen>
      {membership ? (
        <BuildingBar
          buildingName={membership.building.name}
          roleText={roleLabel(membership)}
          onSwitch={onSwitch}
        />
      ) : (
        <BackLink label="My buildings" onPress={onBack} />
      )}

      <View style={styles.eyebrow}>
        <Eyebrow text="SETTINGS" />
      </View>
      <Text style={styles.title}>Your account</Text>

      <View style={styles.card}>
        <Avatar name={account.display_name} />
        <View style={styles.who}>
          <Text style={styles.name} numberOfLines={1}>
            {account.display_name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {account.email}
          </Text>
        </View>
      </View>

      {membership ? (
        <>
          <Text style={styles.sectionLabel}>THIS BUILDING</Text>
          <View style={styles.card}>
            <View style={styles.who}>
              <Text style={styles.name}>{membership.building.name}</Text>
              <Text style={styles.email}>You are {roleLabel(membership).toLowerCase()} here.</Text>
            </View>
          </View>
          <TextLink danger label="Leave this building" onPress={onLeave} />
        </>
      ) : null}

      <View style={styles.spacer} />
      <Button variant="outline" label="Log out" onPress={onLogOut} />
      <TextLink danger label="Delete my account" onPress={onDeleteAccount} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: 22 },
  title: {
    marginTop: 10,
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  card: { ...cardStyle, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  who: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  email: { marginTop: 2, fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  sectionLabel: {
    marginTop: 22,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.muted,
  },
  spacer: { flexGrow: 1, minHeight: 24 },
});
