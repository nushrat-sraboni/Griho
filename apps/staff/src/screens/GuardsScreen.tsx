// apps/staff/src/screens/GuardsScreen.tsx
//
// The manager's "Guards" screen, matching the design. It lists every guard of the
// building with a Remove button. Tapping Remove slides up a box that asks the
// manager to type the guard's name to confirm. The red button only turns on when
// the typed name matches (ignoring capital letters and spaces at the ends), and
// the backend checks the name again. A removed guard loses access right away.
// The data comes from the pretend backend until the real one exists.
// Owned by Sraboni.

import type { MemberListItem } from '@griho/shared';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from 'react-native';

import Avatar from '../components/Avatar';
import Brand from '../components/Brand';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import Eyebrow from '../components/Eyebrow';
import Field from '../components/Field';
import { listGuards, removeMember } from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { colors, styles } from '../styles';
import { namesMatch } from '../text';

type Props = {
  displayName: string;
  buildingName: string;
  /** Called after a guard is removed, so other screens can read the new numbers. */
  onChanged: () => void;
};

export default function GuardsScreen({ displayName, buildingName, onChanged }: Props) {
  const [guards, setGuards] = useState<MemberListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The guard the manager is about to remove (null means the box is closed).
  const [selected, setSelected] = useState<MemberListItem | null>(null);
  const [typedName, setTypedName] = useState('');
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setGuards(await listGuards());
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function openSheet(guard: MemberListItem) {
    setSelected(guard);
    setTypedName('');
    setSheetError(null);
  }

  function closeSheet() {
    setSelected(null);
    setTypedName('');
    setSheetError(null);
  }

  async function handleRemove() {
    if (!selected) return;
    setSheetError(null);
    setBusy(true);
    try {
      await removeMember(selected.membership_id, typedName);
      closeSheet();
      await refresh();
      onChanged();
    } catch (caught) {
      setSheetError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  const count = guards?.length ?? 0;
  const subtitle =
    guards === null
      ? ' '
      : count === 0
        ? 'There are no guards yet.'
        : `${count} guard${count === 1 ? ' works' : 's work'} in ${buildingName}.`;

  return (
    <>
      <Brand right={<Avatar name={displayName} size={40} />} />
      <Eyebrow>Your team</Eyebrow>
      <Text style={styles.title}>Guards.</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.card, local.listCard]}>
        {guards !== null && guards.length === 0 ? (
          <Text style={local.empty}>
            No guards yet. Make a guard code on the Access tab and approve the requests.
          </Text>
        ) : null}
        {(guards ?? []).map((guard, index) => (
          <View key={guard.membership_id} style={[local.row, index > 0 && local.rowDivider]}>
            <Avatar name={guard.display_name} />
            <View style={local.rowText}>
              <Text style={local.name}>{guard.display_name}</Text>
              <Text style={local.detail}>Guard</Text>
            </View>
            <View style={local.removeButton}>
              <OutlineButton
                compact
                tone="danger"
                label="Remove"
                onPress={() => openSheet(guard)}
              />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.note}>
        Removing a guard asks you to type their name first. They lose access right away.
      </Text>

      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
      >
        <KeyboardAvoidingView
          style={local.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={local.sheet} accessibilityViewIsModal>
            <View style={local.handle} />
            <Text style={local.sheetTitle}>Remove {selected?.display_name}?</Text>
            <Text style={local.sheetText}>
              They lose access to {buildingName} right away. Type their name to confirm.
            </Text>
            <Field
              label="Type the name"
              value={typedName}
              onChangeText={setTypedName}
              placeholder={selected?.display_name}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {sheetError ? <Text style={styles.error}>{sheetError}</Text> : null}
            <PrimaryButton
              danger
              label={busy ? 'Removing...' : 'Remove guard'}
              onPress={handleRemove}
              disabled={busy || !selected || !namesMatch(typedName, selected.display_name)}
            />
            <View style={local.cancelWrap}>
              <OutlineButton compact label="Cancel" onPress={closeSheet} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const local = StyleSheet.create({
  listCard: { paddingVertical: 6 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19, paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 68 },
  rowDivider: { borderTopWidth: 1, borderTopColor: '#eff2ee' },
  rowText: { flex: 1, marginLeft: 12 },
  name: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 12, marginTop: 2 },
  removeButton: { width: 92 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18,58,48,0.45)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8dfd9',
    marginBottom: 18,
  },
  sheetTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  cancelWrap: { marginTop: 10 },
  sheetText: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
});
