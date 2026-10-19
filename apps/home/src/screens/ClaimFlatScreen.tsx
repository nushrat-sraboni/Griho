// apps/home/src/screens/ClaimFlatScreen.tsx
//
// Asks the owner to confirm taking over a flat that has no owner. It explains
// the two things that matter: the person becomes the flat's owner, and the
// people who lived there before are NOT brought back; they must join again with
// a new flat code (PRD 5.11). The building bar stays at the top so the
// building's name is always visible. Owned by Bishal.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Flat } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextLink from '../components/TextLink';
import { roleLabel } from '../buildings';
import { friendlyErrorMessage } from '../friendlyMessages';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  membership: MembershipWithLastOwner;
  flat: Flat;
  /** Go back to the flats list without claiming. */
  onBack: () => void;
  onSwitch: () => void;
  /** Called after claiming, with a green sentence to show on the flats list. */
  onDone: (message: string) => void;
};

export default function ClaimFlatScreen({ membership, flat, onBack, onSwitch, onDone }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleClaim() {
    setError(null);
    setBusy(true);
    try {
      const claimed = await api.claimFlat({ flat_id: flat.id });
      onDone(`Flat ${claimed.label} is now yours.`);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <BuildingBar
        buildingName={membership.building.name}
        roleText={roleLabel(membership)}
        onSwitch={onSwitch}
      />
      <BackLink label="Flats" onPress={onBack} />

      <View style={styles.eyebrow}>
        <Eyebrow text="NO OWNER" />
      </View>
      <Text style={styles.title}>Claim flat {flat.label}</Text>
      <Text style={styles.subtitle}>This flat has no owner right now.</Text>

      <View style={styles.card}>
        <View style={styles.flatRow}>
          <View
            style={styles.tile}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text style={styles.tileText} numberOfLines={1} adjustsFontSizeToFit>
              {flat.label}
            </Text>
          </View>
          <View>
            <Text style={styles.flatName}>Flat {flat.label}</Text>
            <Text style={styles.buildingName}>{membership.building.name}</Text>
          </View>
        </View>

        <Text style={styles.body}>
          If you claim it, <Text style={styles.bold}>you become the owner of this flat</Text>. You
          can then make a join code for it.
        </Text>

        <Notice
          kind="info"
          text="People who lived here before are not brought back. They must join again with a new flat code."
        />
        {error ? <Notice kind="error" text={error} /> : null}

        <View style={styles.buttonSpace}>
          <Button
            label="Claim flat"
            arrow
            busy={busy}
            busyLabel="Claiming..."
            onPress={handleClaim}
          />
        </View>
        <TextLink label="Cancel" onPress={onBack} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: 4 },
  title: {
    marginTop: 10,
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  card: { ...cardStyle, marginTop: 20 },
  flatRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tile: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.pillAmber,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tileText: { fontFamily: fonts.extraBold, fontSize: 16, color: colors.pillAmberText },
  flatName: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  buildingName: { marginTop: 2, fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
  body: {
    marginTop: 16,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  bold: { fontFamily: fonts.bold },
  buttonSpace: { marginTop: 20 },
});
