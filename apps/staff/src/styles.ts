// apps/staff/src/styles.ts
//
// The shared look for the Griho Staff screens. The colours and shapes come from
// the Griho design reference (the owner-portal preview): a warm cream background,
// soft white cards, a deep green for buttons, and rounded corners.
// Keeping them here means every screen looks the same. Owned by Sraboni.

import { StyleSheet } from 'react-native';

// The colours from the design reference, in one place.
export const colors = {
  ink: '#243c39',
  muted: '#73817b',
  green: '#2e6b61',
  dark: '#20564e',
  mint: '#e1eee8',
  cream: '#faf8f2',
  line: '#e7ece7',
  gold: '#c58c45',
  sand: '#f7ebdd',
  white: '#ffffff',
  error: '#b42318',
};

export const styles = StyleSheet.create({
  // The whole screen: cream background, with the card centred in it.
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: 22,
    justifyContent: 'center',
  },
  // The soft white card that holds each screen's content.
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.white,
    shadowColor: colors.ink,
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  // The "G" logo row at the top of the log-in and join screens.
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  brandMarkText: { color: colors.white, fontSize: 22, fontWeight: '900' },
  brandName: { color: colors.ink, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  brandTagline: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // A small green label above the big title, like "PRIVATE COMMUNICATION" in the design.
  eyebrow: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 18 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.white,
    color: colors.ink,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  buttonDisabled: { opacity: 0.5 },
  link: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 16,
  },
  error: { color: colors.error, fontSize: 12, marginTop: 14, lineHeight: 18 },
  // A soft note box, like the grey notices in the design.
  note: {
    backgroundColor: '#f4f7f2',
    color: colors.muted,
    borderRadius: 13,
    padding: 13,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
  },
});
