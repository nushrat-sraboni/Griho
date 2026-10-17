// apps/home/src/screens/CreateBuildingScreen.tsx
//
// The "Create your building" form of Griho Home. The person types the building's
// name, address and contact info (all three are needed). Empty boxes get a red
// border and a short sentence under them. If the backend refuses, a plain red
// sentence explains why. The person becomes the first owner, and no join codes
// are made yet (PRD 5.2). Owned by Bishal.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Building } from '@griho/shared';

import { api } from '../api';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Logo from '../components/Logo';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import TextLink from '../components/TextLink';
import { checkBuildingForm, hasProblems, type BuildingFormProblems } from '../buildings';
import { friendlyErrorMessage } from '../friendlyMessages';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  onBack: () => void;
  /** Called with the new building. May be async; a failure shows as a red message here. */
  onCreated: (building: Building) => void | Promise<void>;
};

export default function CreateBuildingScreen({ onBack, onCreated }: Props) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [problems, setProblems] = useState<BuildingFormProblems>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    setError(null);
    const found = checkBuildingForm({ name, address, contactInfo });
    setProblems(found);
    if (hasProblems(found)) return;

    setBusy(true);
    try {
      const building = await api.createBuilding({
        name,
        address,
        contact_info: contactInfo,
      });
      await onCreated(building);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={styles.topRow}>
        <BackButton label="Back to my buildings" onPress={onBack} />
        <Logo />
      </View>

      <View style={styles.eyebrow}>
        <Eyebrow text="NEW BUILDING" />
      </View>
      <Text style={styles.title}>Create your building</Text>
      <Text style={styles.subtitle}>You become its first owner. All three boxes are needed.</Text>

      <View style={styles.form}>
        <TextField
          label="Building name"
          value={name}
          onChangeText={setName}
          placeholder="Green Tower"
          error={problems.name}
          autoComplete="off"
        />
        <TextField
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="12 Lake Road"
          error={problems.address}
          autoComplete="street-address"
        />
        <TextField
          label="Contact info"
          value={contactInfo}
          onChangeText={setContactInfo}
          placeholder="A phone number or email"
          error={problems.contactInfo}
          capitalize="none"
          autoComplete="off"
        />

        <Notice
          kind="info"
          text="No join codes are made yet. You make them later, only when you ask."
        />
        {error ? <Notice kind="error" text={error} /> : null}

        <View style={styles.buttonSpace}>
          <Button
            label="Create building"
            arrow
            busy={busy}
            busyLabel="Creating..."
            onPress={handleCreate}
          />
        </View>
        <TextLink label="Cancel" onPress={onBack} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { marginTop: 22 },
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
  form: { ...cardStyle, marginTop: 20, paddingTop: 6 },
  buttonSpace: { marginTop: 20 },
});
