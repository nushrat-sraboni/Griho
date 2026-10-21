// apps/home/src/screens/RemovePersonScreen.tsx
//
// Asks an owner to confirm removing a person from the building. It says what
// happens: the person loses access right away, their old messages stay marked
// "Former member", and they may ask to join again later (PRD 5.7). The owner must
// type the person's name before the red button works. The backend checks the
// name again. The building bar stays at the top so the building's name is always
// visible. Owned by Bishal.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MemberListItem } from '@griho/shared';

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
import { friendlyErrorMessage } from '../friendlyMessages';
import { roleWords } from '../joining';
import { typedNameMatches } from '../people';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  membership: MembershipWithLastOwner;
  person: MemberListItem;
  /** Go back to the people list without removing. */
  onBack: () => void;
  onSwitch: () => void;
  /** Called after removing, with a green sentence to show on the people list. */
  onRemoved: (message: string) => void;
};

export default function RemovePersonScreen({
  membership,
  person,
  onBack,
  onSwitch,
  onRemoved,
}: Props) {
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = typedNameMatches(typed, person.display_name);

  async function handleRemove() {
    setError(null);
    setBusy(true);
    try {
      await api.removeMember({ membership_id: person.membership_id, typed_name: typed });
      onRemoved(`${person.display_name} was removed from ${membership.building.name}.`);
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
      <BackLink label="People" onPress={onBack} />

      <View style={styles.eyebrow}>
        <Eyebrow text="REMOVE A PERSON" />
      </View>
      <Text style={styles.title}>Remove {person.display_name}?</Text>
      <Text style={styles.subtitle}>{roleWords(person.role, person.flat_label)}</Text>

      <View style={styles.card}>
        <Text style={styles.body}>
          {person.display_name}{' '}
          <Text style={styles.bold}>loses access to {membership.building.name} right away</Text>.
        </Text>

        <Notice
          kind="info"
          text={`Their old messages stay in the chats, marked "Former member". They can ask to join again later, and you can say no.`}
        />
        {error ? <Notice kind="error" text={error} /> : null}

        <TextField
          label={`Type ${person.display_name}'s name to confirm`}
          value={typed}
          onChangeText={setTyped}
          autoComplete="off"
          hint="Capital letters and extra spaces do not matter."
        />

        <View style={styles.buttonSpace}>
          <Button
            variant="danger"
            label={`Remove ${person.display_name}`}
            disabled={!ready}
            busy={busy}
            busyLabel="Removing..."
            onPress={handleRemove}
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
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.ink },
  bold: { fontFamily: fonts.bold },
  buttonSpace: { marginTop: 20 },
});
