// apps/staff/App.tsx
//
// The main screen of Griho Staff (managers and guards).
// For now it is only a "hello" screen. It also reads one value from the shared
// toolbox (@griho/shared) to prove the two projects are connected.
// Real screens come later. Owned by Sraboni.

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ERROR_CODES } from '@griho/shared';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Griho Staff</Text>
      <Text>For managers and guards</Text>
      <Text style={styles.small}>Shared toolbox connected: {ERROR_CODES.length} error codes</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  small: { marginTop: 16, color: '#666' },
});
