import { describe, expect, it } from 'vitest';

import { tabForScreen } from './tabs';

describe('tabForScreen', () => {
  it('lights Home for the building page and the pages opened from it', () => {
    for (const screen of ['building', 'requests', 'people', 'flats', 'codes', 'codeDetail']) {
      expect(tabForScreen(screen)).toBe('home');
    }
  });

  it('lights Messages for the chat list and the new message page', () => {
    expect(tabForScreen('messages')).toBe('messages');
    expect(tabForScreen('newMessage')).toBe('messages');
  });

  it('lights Settings for the settings page', () => {
    expect(tabForScreen('settings')).toBe('settings');
  });

  it('shows no bar in a chat, on forms, on confirm screens or outside a building', () => {
    for (const screen of [
      'chat',
      'deleteMessage',
      'flatForm',
      'claimFlat',
      'makeCode',
      'removePerson',
      'leaveBuilding',
      'deleteAccount',
      'buildings',
      'logIn',
    ]) {
      expect(tabForScreen(screen)).toBeNull();
    }
  });
});
