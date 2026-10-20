// apps/staff/src/screens/GuardHomeScreen.tsx
//
// The home screen of a guard who belongs to a building. It matches the "Guard home"
// design: a welcome line, a green banner with the building name and address, the
// guard's role and access, a note that guards have nothing else to do, and the
// "Leave this building" and "Log out" buttons. Leaving asks the guard to type
// their own name first. The bottom menu (Home and Messages) is passed in. Owned by Sraboni.

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Brand from '../components/Brand';
import Eyebrow from '../components/Eyebrow';
import HeroCard from '../components/HeroCard';
import LeaveSection from '../components/LeaveSection';
import Screen from '../components/Screen';
import type { Membership } from '../fakeBackend';
import { colors, styles } from '../styles';

type Props = {
  displayName: string;
  membership: Membership;
  onLeft: () => void;
  onLogOut: () => void;
  /** The bottom menu, shown at the bottom of the screen. */
  footer?: ReactNode;
};

// One row of the little "role and access" card: a title, a grey line, and a badge.
function InfoRow({ title, detail, badge }: { title: string; detail: string; badge: string }) {
  return (
    <View style={local.infoRow}>
      <View style={local.infoText}>
        <Text style={local.infoTitle}>{title}</Text>
        <Text style={local.infoDetail}>{detail}</Text>
      </View>
      <Text style={styles.badge}>{badge}</Text>
    </View>
  );
}

export default function GuardHomeScreen({
  displayName,
  membership,
  onLeft,
  onLogOut,
  footer,
}: Props) {
  const firstName = displayName.trim().split(' ')[0];

  return (
    <Screen footer={footer}>
      <Brand />
      <Eyebrow>Guard</Eyebrow>
      <Text style={styles.title}>Welcome, {firstName}.</Text>
      <Text style={styles.subtitle}>You are part of this building.</Text>

      <HeroCard
        label="Your building"
        title={membership.building_name}
        detail={membership.address}
      />

      <View style={[styles.card, local.infoCard]}>
        <InfoRow title="Your role" detail="Set by your code" badge="Guard" />
        <View style={local.divider} />
        <InfoRow title="Access" detail="Approved by the manager" badge="Active" />
      </View>

      <Text style={styles.note}>
        You can message anyone in your building, and anyone can message you. Open Messages to start.
      </Text>

      <View style={styles.spacer} />
      <LeaveSection
        displayName={displayName}
        buildingName={membership.building_name}
        onLeft={onLeft}
        onLogOut={onLogOut}
      />
    </Screen>
  );
}

const local = StyleSheet.create({
  infoCard: { paddingVertical: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', minHeight: 60 },
  infoText: { flex: 1 },
  infoTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  infoDetail: { color: colors.muted, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#eff2ee' },
});
