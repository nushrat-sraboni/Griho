// apps/staff/src/styles.ts
//
// The shared look for the Griho Staff screens. The colours and shapes follow the
// Griho Staff design: a warm cream background, deep green for buttons and the
// banner, soft white cards with very round corners, and heavy dark-green headlines.
// Keeping them here means every screen looks the same. Owned by Sraboni.

import { Platform, StatusBar, StyleSheet } from 'react-native';

// The colours from the design, in one place.
export const colors = {
  ink: '#123a30', // headlines and strong text
  muted: '#5b6a64', // grey helper text
  green: '#19705b', // buttons, links, the banner
  greenSoft: '#1f7e6a', // the lighter circle inside the banner
  mint: '#e1eee8', // pale green badges
  cream: '#f7f5f0', // the screen background
  line: '#ecefeb', // thin card borders
  gold: '#c58c45', // the little gold line above headlines
  goldDot: '#e2a93b', // the gold tile in the logo
  sand: '#f7ebdd', // pale gold notes
  sandText: '#6b4412', // text on sand
  inputBg: '#f3f5f2', // inside a text box
  inputBorder: '#9aa9a2', // a text box's edge
  ring: '#d4e6dc', // the circles in the top corner
  ringFill: '#e9f0ea',
  softGrey: '#eceeea', // hint boxes
  danger: '#a3302a', // leave and remove buttons
  white: '#ffffff',
  error: '#b42318',
};

// The gap at the top of a screen, so content stays clear of the phone's clock and notch.
export const TOP_INSET = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 12;

export const styles = StyleSheet.create({
  // The whole screen: cream background.
  screen: { flex: 1, backgroundColor: colors.cream },
  // The scrolling content: sits on top of the circles.
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: TOP_INSET, paddingBottom: 24 },
  // A soft white card.
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 14,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 38,
    marginTop: 10,
  },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 8 },
  // A soft grey hint box.
  note: {
    backgroundColor: colors.softGrey,
    color: colors.muted,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  // A pale gold note, used for the "each app needs its own email" reminder.
  noteSand: {
    backgroundColor: colors.sand,
    color: colors.sandText,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
  },
  link: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  error: { color: colors.error, fontSize: 13, marginTop: 14, lineHeight: 18 },
  // A small round-cornered label, like "Guard" or "Active".
  badge: {
    backgroundColor: colors.mint,
    color: colors.green,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },
  // The space that pushes the bottom buttons down to the bottom of the screen.
  spacer: { flex: 1, minHeight: 20 },
});
