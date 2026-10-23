// apps/staff/src/screens/SettingsScreen.tsx
//
// The "Settings" screen, a tab in the bottom menu. It shows who the person is (their
// name, their role, and their building) and holds the three account actions that used
// to sit at the bottom of the home screen: "Leave this building", "Log out", and
// "Delete my account". Leaving and deleting each ask the person to type their own
// name first, as the product rules require. The look follows the Griho Staff design.
// Owned by Sraboni.

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { roleWord } from '../chatTarget';
import Avatar from '../components/Avatar';
import Brand from '../components/Brand';
import Eyebrow from '../components/Eyebrow';
import LeaveSection from '../components/LeaveSection';
import RoleBadge from '../components/RoleBadge';
import type { Membership } from '../fakeBackend';
import { colors, styles } from '../styles';

type Props = {
  displayName: string;
  membership: Membership;
  onLeft: () => void;
  onLogOut: () => void;
};

// One row of the "your details" card: a small grey title and the value under it.
function DetailRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={local.row}>
      <Text style={local.rowTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen({ displayName, membership, onLeft, onLogOut }: Props) {
  return (
    <>
      <Brand right={<Avatar name={displayName} size={40} />} />
      <Eyebrow>Your account</Eyebrow>
      <Text style={styles.title}>Settings.</Text>
      <Text style={styles.subtitle}>Your details, and leaving or logging out.</Text>

      <View style={[styles.card, local.card]}>
        <DetailRow title="Name">
          <Text style={local.value}>{displayName}</Text>
        </DetailRow>
        <View style={local.divider} />
        <DetailRow title="Role">
          <View style={local.badgeWrap}>
            <RoleBadge role={membership.role} />
            <Text style={local.roleText}>{roleWord(membership.role)} in this building</Text>
          </View>
        </DetailRow>
        <View style={local.divider} />
        <DetailRow title="Building">
          <Text style={local.value}>{membership.building_name}</Text>
          <Text style={local.detail}>{membership.address}</Text>
        </DetailRow>
      </View>

      <View style={local.actions}>
        <LeaveSection
          displayName={displayName}
          buildingName={membership.building_name}
          onLeft={onLeft}
          onLogOut={onLogOut}
        />
      </View>
    </>
  );
}

const local = StyleSheet.create({
  card: { paddingVertical: 6 },
  row: { paddingVertical: 14 },
  rowTitle: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  value: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#eff2ee' },
  badgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleText: { color: colors.muted, fontSize: 12 },
  actions: { marginTop: 10 },
});
