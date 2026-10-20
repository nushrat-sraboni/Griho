// apps/staff/src/components/DeleteAccountSection.tsx
//
// The "Delete my account" part that sits at the bottom of the guard home, the
// manager overview, and the join and waiting screens. It starts as a quiet red link.
// Tapping it opens a confirmation card that explains what will happen and asks the
// person to type their own name first, as the product rules require. The red button
// only turns on when the typed name matches (ignoring capital letters and spaces at
// the ends), and the backend checks the name again. After the account is deleted the
// app goes back to the log-in screen. Owned by Sraboni.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { deleteAccount } from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { colors, styles } from '../styles';
import { namesMatch } from '../text';
import { OutlineButton, PrimaryButton } from './Buttons';
import Field from './Field';

type Props = {
  displayName: string;
  /** Called after the account is deleted, so the app can return to the log-in screen. */
  onDeleted: () => void;
};

export default function DeleteAccountSection({ displayName, onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(false);
    setTypedName('');
    setError(null);
  }

  async function handleDelete() {
    setError(null);
    setBusy(true);
    try {
      await deleteAccount(typedName);
      onDeleted();
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Pressable
        style={local.link}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Delete my account"
      >
        <Text style={local.linkText}>Delete my account</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={local.title}>Delete your account?</Text>
      <Text style={local.text}>
        Your login is removed for good, and you can no longer use this account. Your old messages
        stay and show as "Deleted account". Type your name to confirm.
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
        label={busy ? 'Deleting...' : 'Delete account'}
        onPress={handleDelete}
        disabled={busy || !namesMatch(typedName, displayName)}
      />
      <OutlineButton label="Cancel" onPress={close} disabled={busy} />
    </View>
  );
}

const local = StyleSheet.create({
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  linkText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  text: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
});
