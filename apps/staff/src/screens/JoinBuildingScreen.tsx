// apps/staff/src/screens/JoinBuildingScreen.tsx
//
// The "join a building" screen of Griho Staff. A manager or guard types the code
// they were given, then taps "Send request". If the code works, the request is
// sent and the app moves on to the waiting screen. If not, a plain sentence says why.
// Owned by Sraboni.

import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import Brand from '../components/Brand';
import { submitJoinRequest, type JoinRequestResult } from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { styles } from '../styles';

type Props = {
  onRequestSent: (request: JoinRequestResult) => void;
  onLogOut: () => void;
};

export default function JoinBuildingScreen({ onRequestSent, onLogOut }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    setError(null);
    setBusy(true);
    try {
      const request = await submitJoinRequest(code);
      onRequestSent(request);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Brand />
        <Text style={styles.eyebrow}>Join a building</Text>
        <Text style={styles.title}>Enter your code.</Text>
        <Text style={styles.subtitle}>Type the code you were given by the building owner.</Text>

        <Text style={styles.label}>Code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="For example: GUARD-2468"
          placeholderTextColor="#9aa6a0"
          autoCapitalize="characters"
          autoCorrect={false}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, (busy || !code.trim()) && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={busy || !code.trim()}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{busy ? 'Sending...' : 'Send request'}</Text>
        </Pressable>

        <Pressable onPress={onLogOut} accessibilityRole="button">
          <Text style={styles.link}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}
