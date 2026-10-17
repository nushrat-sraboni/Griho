// apps/staff/src/screens/BuildingHomeScreen.tsx
//
// The home screen a person sees once they belong to a building. For a guard it
// matches the "Guard home" design: a welcome line, a green banner with the building
// name and address, the person's role, a note that guards have nothing else to do,
// and a "Leave this building" button. Leaving asks the person to type their own
// name first, as the product rules require. A manager sees the same screen with a
// note that their manager tools come in a later step.
// The look follows the Griho Staff design. Owned by Sraboni.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Brand from '../components/Brand';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import Eyebrow from '../components/Eyebrow';
import Field from '../components/Field';
import HeroCard from '../components/HeroCard';
import Screen from '../components/Screen';
import { leaveBuilding, type Membership } from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { colors, styles } from '../styles';

type Props = {
  displayName: string;
  membership: Membership;
  onLeft: () => void;
  onLogOut: () => void;
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

export default function BuildingHomeScreen({ displayName, membership, onLeft, onLogOut }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isGuard = membership.role === 'guard';
  const roleName = isGuard ? 'Guard' : 'Manager';
  const firstName = displayName.trim().split(' ')[0];

  async function handleLeave() {
    setError(null);
    setBusy(true);
    try {
      await leaveBuilding(typedName);
      onLeft();
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  function closeConfirm() {
    setConfirming(false);
    setTypedName('');
    setError(null);
  }

  return (
    <Screen>
      <Brand />
      <Eyebrow>{roleName}</Eyebrow>
      <Text style={styles.title}>Welcome, {firstName}.</Text>
      <Text style={styles.subtitle}>You are part of this building.</Text>

      <HeroCard
        label="Your building"
        title={membership.building_name}
        detail={membership.address}
      />

      <View style={[styles.card, local.infoCard]}>
        <InfoRow title="Your role" detail="Set by your code" badge={roleName} />
        <View style={local.divider} />
        <InfoRow
          title="Access"
          detail={isGuard ? 'Approved by the manager' : 'Approved by an owner'}
          badge="Active"
        />
      </View>

      <Text style={styles.note}>
        {isGuard
          ? 'Guards do not send or receive messages. There is nothing else for you to do here for now.'
          : 'Your manager tools (codes, requests, guards, and messages) are coming in the next step.'}
      </Text>

      <View style={styles.spacer} />

      {confirming ? (
        <View style={styles.card}>
          <Text style={local.confirmTitle}>Leave {membership.building_name}?</Text>
          <Text style={local.confirmText}>
            You lose access right away. Type your name to confirm.
          </Text>
          <Field
            label="Type your name"
            value={typedName}
            onChangeText={setTypedName}
            placeholder={displayName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            danger
            label={busy ? 'Leaving...' : 'Leave building'}
            onPress={handleLeave}
            disabled={busy || !typedName.trim()}
          />
          <OutlineButton label="Cancel" onPress={closeConfirm} />
        </View>
      ) : (
        <>
          <OutlineButton
            label="Leave this building"
            tone="danger"
            onPress={() => setConfirming(true)}
          />
          <OutlineButton label="Log out" onPress={onLogOut} />
        </>
      )}
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
  confirmTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  confirmText: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 8 },
});
