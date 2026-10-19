// apps/home/src/screens/MakeCodeScreen.tsx
//
// The "Make a join code" form of Griho Home. The owner picks who the code is for
// (building, flat, manager or guard), picks a flat when it is a flat code, and
// types how many people can use it (1 to 1000). Codes are only made when the
// owner asks, and a code alone lets nobody in: every request still needs the
// owner's approval (PRD 5.4, 5.5). The building bar stays at the top so the
// building's name is always visible. Owned by Bishal.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CodeInfo, CodeType } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import ChoiceCard from '../components/ChoiceCard';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import TextLink from '../components/TextLink';
import { roleLabel } from '../buildings';
import { checkCodeForm, CODE_CHOICES, type CodeFormProblems } from '../codes';
import { friendlyErrorMessage } from '../friendlyMessages';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  onBack: () => void;
  onSwitch: () => void;
  /** Called with the new code, so the app can open it. */
  onMade: (code: CodeInfo) => void;
};

export default function MakeCodeScreen({ membership, onBack, onSwitch, onMade }: Props) {
  const [type, setType] = useState<CodeType>('flat');
  const [flatId, setFlatId] = useState<string | null>(null);
  const [usesText, setUsesText] = useState('1');
  const [problems, setProblems] = useState<CodeFormProblems>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: flats } = useLoad(() => api.listFlats({ building_id: membership.building.id }));
  // Until the person picks a flat, the first one is used, so the common case needs no extra tap.
  const chosenFlatId = flatId ?? flats?.[0]?.id ?? null;

  async function handleMake() {
    setError(null);
    const { problems: found, maxUses } = checkCodeForm({ type, flatId: chosenFlatId, usesText });
    setProblems(found);
    if (Object.keys(found).length > 0 || maxUses === undefined) return;

    setBusy(true);
    try {
      const code = await api.createCode({
        building_id: membership.building.id,
        type,
        max_uses: maxUses,
        ...(type === 'flat' && chosenFlatId ? { flat_id: chosenFlatId } : {}),
      });
      onMade(code);
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
      <BackLink label="Join codes" onPress={onBack} />

      <View style={styles.eyebrow}>
        <Eyebrow text="NEW CODE" />
      </View>
      <Text style={styles.title}>Make a join code</Text>
      <Text style={styles.subtitle}>Pick who the code is for.</Text>

      <View style={styles.form}>
        <Text style={styles.groupLabel}>Who is it for?</Text>
        <View style={styles.choices} accessibilityRole="radiogroup">
          {CODE_CHOICES.map((choice) => (
            <ChoiceCard
              key={choice.type}
              title={choice.title}
              help={choice.help}
              selected={type === choice.type}
              onPress={() => setType(choice.type)}
            />
          ))}
        </View>

        {type === 'flat' ? (
          <View style={styles.flatGroup}>
            <Text style={styles.groupLabel}>Which flat?</Text>
            {flats && flats.length === 0 ? (
              <Text style={styles.noFlats}>You have no flats yet. Add a flat first.</Text>
            ) : null}
            <View style={styles.chips}>
              {(flats ?? []).map((flat) => {
                const picked = flat.id === chosenFlatId;
                return (
                  <Pressable
                    key={flat.id}
                    onPress={() => setFlatId(flat.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: picked }}
                    accessibilityLabel={`Flat ${flat.label}`}
                    style={[styles.chip, picked && styles.chipPicked]}
                  >
                    <Text style={[styles.chipText, picked && styles.chipTextPicked]}>
                      {flat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {problems.flat ? <Text style={styles.problem}>{problems.flat}</Text> : null}
          </View>
        ) : null}

        <TextField
          label="How many people can use it?"
          kind="number"
          value={usesText}
          onChangeText={setUsesText}
          error={problems.uses}
          hint="1 means one person only. You can choose up to 1000."
        />

        <Notice
          kind="info"
          text="A code alone does not let anyone in. You still approve every request."
        />
        {error ? <Notice kind="error" text={error} /> : null}

        <View style={styles.buttonSpace}>
          <Button label="Make code" arrow busy={busy} busyLabel="Making..." onPress={handleMake} />
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
  form: { ...cardStyle, marginTop: 20 },
  groupLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink, marginBottom: 8 },
  choices: { gap: 8 },
  flatGroup: { marginTop: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minWidth: 64,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipPicked: {
    borderWidth: 2,
    borderColor: colors.teal,
    backgroundColor: colors.selectedBackground,
    paddingHorizontal: 15,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  chipTextPicked: { color: colors.pillTealText },
  noFlats: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
  problem: { marginTop: 6, fontFamily: fonts.semiBold, fontSize: 13, color: colors.errorText },
  buttonSpace: { marginTop: 20 },
});
