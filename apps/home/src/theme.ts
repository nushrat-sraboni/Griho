// apps/home/src/theme.ts
//
// The look of Griho Home in one place: colors, font names, and the soft white
// "card" style. Every screen and piece uses these, so the whole app looks like
// one family. The values come from the approved design (cream page, deep teal,
// a little amber like a lit window). Owned by Bishal.

import type { ViewStyle } from 'react-native';

export const colors = {
  /** The warm cream page behind everything. */
  page: '#F7F5EF',
  /** Main dark text, a very deep green. */
  ink: '#14352D',
  /** Quieter text under headings. */
  muted: '#5B6B66',
  /** Text and buttons: the main teal. */
  teal: '#17705F',
  /** A slightly lighter teal used for the soft circle inside teal cards. */
  tealLight: '#1D7C6A',
  /** Small text on top of a teal card. */
  onTealSoft: '#CFE6DF',
  onTealBody: '#DCEDE8',
  /** The amber of a lit window. */
  amber: '#F5B544',
  /** The darker amber used for the little dash before small labels. */
  amberDark: '#C9852E',
  white: '#FFFFFF',
  /** Thin lines around cards. */
  border: '#E7EAE4',
  /** Text boxes. */
  fieldBackground: '#F4F6F3',
  fieldBorder: '#7C8E89',
  placeholder: '#5F706C',
  /** The pale green circles behind the top of each screen. */
  mint: '#E8F1EC',
  arc: '#D3E1D9',
  /** The small grey pill that says "Testing only". */
  chip: '#EDEFE9',
  /** A pale square (a window with the light off). */
  windowOff: '#E1ECE9',
  /** Red message box. */
  errorBackground: '#FDECEA',
  errorText: '#8C1D18',
  /** Yellow message box. */
  noteBackground: '#FFF3DB',
  noteText: '#4A3200',
  /** Dark brown for text drawn on top of amber. */
  onAmber: '#3A2600',
} as const;

/** The font names. They must match the names loaded in App.tsx. */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

/** The soft white card that holds forms and lists. */
export const cardStyle: ViewStyle = {
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 24,
  padding: 20,
  shadowColor: colors.ink,
  shadowOpacity: 0.06,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
};
