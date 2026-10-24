// apps/home/src/tabs.ts
//
// Which screens show the bottom bar (Home, Messages, Settings) and which tab is
// lit on each. Screens that are not listed here (a chat, forms with a keyboard,
// confirm screens, "My buildings") show no bottom bar. Kept apart from the
// screens so it can be tested. Owned by Bishal.

export type TabName = 'home' | 'messages' | 'settings';

const TAB_FOR_SCREEN: Record<string, TabName> = {
  building: 'home',
  requests: 'home',
  people: 'home',
  flats: 'home',
  codes: 'home',
  codeDetail: 'home',
  deleteCode: 'home',
  messages: 'messages',
  newMessage: 'messages',
  settings: 'settings',
};

/** The tab to light up for this screen, or null when the screen has no bottom bar. */
export function tabForScreen(screen: string): TabName | null {
  return TAB_FOR_SCREEN[screen] ?? null;
}
