// apps/staff/src/screens/GuardHomeScreen.tsx
//
// The home screen of a guard who belongs to a building. It matches the "Guard home"
// design: a welcome line, a green banner with the building name and address, the
// guard's role and access, and a note about what guards can do. Leaving the building,
// logging out, and deleting the account are on the Settings tab, not here. The bottom
// menu (Home, Messages, Settings) is passed in. Owned by Sraboni.

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Brand from '../components/Brand';
import Eyebrow from '../components/Eyebrow';
import HeroCard from '../components/HeroCard';
import Screen from '../components/Screen';
import type { Membership } from '../fakeBackend';
import { colors, styles } from '../styles';

type Props = {
  displayName: string;
  membership: Membership;
  /** The bottom menu, shown at the bottom of the screen. */
  footer?: ReactNode;
};

// One row of the "role and access" card: a title, a grey line, and a badge.
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

export default function GuardHomeScreen({ displayName, membership, footer }: Props) {
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
        To leave the building or log out, open Settings.
      </Text>
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
