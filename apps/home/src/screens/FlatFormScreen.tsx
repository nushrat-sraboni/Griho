// apps/home/src/screens/FlatFormScreen.tsx
//
// One form for two jobs: ADD a new flat, or RENAME one of the person's own
// flats. The person types the flat name. An empty box, or a name that is already
// used in the building, shows a red sentence under the box. Adding a flat makes
// the person its owner and makes no join code (PRD 5.3). The building bar stays
// at the top so the building's name is always visible. Owned by Bishal.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getErrorCode, type Flat } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import TextLink from '../components/TextLink';
import { roleLabel } from '../buildings';
import { checkFlatLabel } from '../flats';
import { friendlyErrorMessage } from '../friendlyMessages';
import { cardStyle, colors, fonts } from '../theme';

export type FlatFormMode = { kind: 'add' } | { kind: 'rename'; flat: Flat };

type Props = {
  membership: MembershipWithLastOwner;
  mode: FlatFormMode;
  /** Go back to the flats list without saving. */
  onBack: () => void;
  onSwitch: () => void;
  /** Called after saving, with a green sentence to show on the flats list. */
  onDone: (message: string) => void;
};

export default function FlatFormScreen({ membership, mode, onBack, onSwitch, onDone }: Props) {
  const isRename = mode.kind === 'rename';
  const [label, setLabel] = useState(mode.kind === 'rename' ? mode.flat.label : '');
  const [labelProblem, setLabelProblem] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setError(null);
    const problem = checkFlatLabel(label);
    setLabelProblem(problem);
    if (problem) return;

    setBusy(true);
    try {
      if (mode.kind === 'rename') {
        const flat = await api.updateFlat({ flat_id: mode.flat.id, label });
        onDone(`Flat renamed to ${flat.label}.`);
      } else {
        const flat = await api.createFlat({ building_id: membership.building.id, label });
        onDone(`Flat ${flat.label} added.`);
      }
    } catch (caught) {
      const sentence = friendlyErrorMessage(caught as { message?: string });
      // A name that is already used belongs under the box; anything else is a general message.
      if (getErrorCode(caught as { message?: string }) === 'FLAT_LABEL_TAKEN') {
        setLabelProblem(sentence);
      } else {
        setError(sentence);
      }
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
        <Eyebrow text={isRename ? 'RENAME FLAT' : 'NEW FLAT'} />
      </View>
      <Text style={styles.title}>
        {mode.kind === 'rename' ? `Rename flat ${mode.flat.label}` : 'Add a flat'}
      </Text>
      <Text style={styles.subtitle}>
        {isRename
          ? 'Only the flat’s owner can change its name.'
          : 'You will be the owner of this flat.'}
      </Text>

      <View style={styles.form}>
        <TextField
          label="Flat name"
          value={label}
          onChangeText={setLabel}
          placeholder="A-1"
          error={labelProblem}
          hint={isRename ? undefined : 'Use the flat number or name that people know it by.'}
          autoComplete="off"
        />

        {isRename ? null : (
          <Notice kind="info" text="A join code for this flat is made later, only when you ask." />
        )}
        {error ? <Notice kind="error" text={error} /> : null}

        <View style={styles.buttonSpace}>
          <Button
            label={isRename ? 'Save name' : 'Add flat'}
            arrow
            busy={busy}
            busyLabel="Saving..."
            onPress={handleSave}
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
  form: { ...cardStyle, marginTop: 20, paddingTop: 6 },
  buttonSpace: { marginTop: 20 },
});
