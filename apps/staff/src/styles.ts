// apps/staff/src/styles.ts
//
// Shared look for the Griho Staff screens: spacing, text sizes, and the form
// boxes and buttons. Keeping them here means every screen looks the same.
// Owned by Sraboni.

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  subtitle: { color: '#666', marginBottom: 24 },
  label: { fontSize: 14, marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1f6feb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.5 },
  link: { color: '#1f6feb', textAlign: 'center', marginTop: 16 },
  error: { color: '#b42318', marginTop: 16 },
  note: { color: '#666', marginTop: 12 },
});
