// apps/home/src/flats.test.ts
//
// Small checks for the flat helpers: the owner words, which buttons a flat
// shows, the summary lines, and the whole add / rename / claim flow on the
// pretend backend. Run with: npm test

import { describe, expect, it } from 'vitest';
import type { Flat } from '@griho/shared';
import { createFakeApi } from './api/fake/fakeApi';
import { createSeededDatabase, FAKE_PASSWORD, SEED } from './api/fake/seed';
import {
  canClaimFlat,
  canRenameFlat,
  checkFlatLabel,
  flatCountSentence,
  flatOwnerText,
  flatOwnerTone,
  flatSummary,
} from './flats';

function flat(label: string, owner: { id: string; name: string } | null): Flat {
  return {
    id: `flat-${label}`,
    building_id: 'b',
    label,
    owner: owner ? { account_id: owner.id, display_name: owner.name } : null,
  };
}

const ME = { id: 'acc-me', name: 'Me' };
const SALMA = { id: 'acc-salma', name: 'Salma' };

function setup() {
  return createFakeApi({ app: 'home', delayMs: 0, database: createSeededDatabase() });
}

async function loginAs(api: ReturnType<typeof setup>, person: keyof typeof SEED.emails) {
  return api.signIn({ email: SEED.emails[person], password: FAKE_PASSWORD });
}

describe('who owns a flat', () => {
  it('tells mine, someone else’s and unowned apart', () => {
    expect(flatOwnerTone(flat('A-1', ME), ME.id)).toBe('mine');
    expect(flatOwnerTone(flat('B-1', SALMA), ME.id)).toBe('other');
    expect(flatOwnerTone(flat('C-1', null), ME.id)).toBe('none');
  });

  it('uses plain words', () => {
    expect(flatOwnerText(flat('A-1', ME), ME.id)).toBe('You own it');
    expect(flatOwnerText(flat('B-1', SALMA), ME.id)).toBe('Owned by Salma');
    expect(flatOwnerText(flat('C-1', null), ME.id)).toBe('No owner');
  });
});

describe('which buttons a flat shows', () => {
  it('lets only the flat owner rename it', () => {
    expect(canRenameFlat(flat('A-1', ME), ME.id)).toBe(true);
    expect(canRenameFlat(flat('B-1', SALMA), ME.id)).toBe(false);
    expect(canRenameFlat(flat('C-1', null), ME.id)).toBe(false);
  });

  it('lets only an unowned flat be claimed', () => {
    expect(canClaimFlat(flat('C-1', null))).toBe(true);
    expect(canClaimFlat(flat('A-1', ME))).toBe(false);
  });
});

describe('summary lines', () => {
  it('counts flats and flats without an owner', () => {
    const flats = [flat('A-1', ME), flat('B-1', SALMA), flat('C-1', null), flat('D-1', null)];
    expect(flatSummary(flats)).toBe('4 flats · 2 without an owner');
    expect(flatCountSentence(flats)).toBe('4 flats in this building.');
  });

  it('keeps it short when every flat has an owner', () => {
    expect(flatSummary([flat('A-1', ME), flat('B-1', SALMA)])).toBe('2 flats');
  });

  it('handles one flat and no flats', () => {
    expect(flatSummary([flat('A-1', ME)])).toBe('1 flat');
    expect(flatCountSentence([flat('A-1', ME)])).toBe('1 flat in this building.');
    expect(flatSummary([])).toBe('No flats yet');
    expect(flatCountSentence([])).toBe('No flats yet.');
  });
});

describe('checkFlatLabel', () => {
  it('asks for a name when the box is empty or only spaces', () => {
    expect(checkFlatLabel('')).toBe('Please type the flat name.');
    expect(checkFlatLabel('   ')).toBe('Please type the flat name.');
  });

  it('is happy with a name', () => {
    expect(checkFlatLabel('D-4')).toBeUndefined();
  });
});

describe('the add, rename and claim flow on the pretend backend', () => {
  it('shows a new flat in the list as mine', async () => {
    const api = setup();
    const rahim = await loginAs(api, 'rahim');
    await api.createFlat({ building_id: SEED.building, label: 'D-4' });
    const flats = await api.listFlats({ building_id: SEED.building });
    const added = flats.find((f) => f.label === 'D-4');
    expect(added && flatOwnerText(added, rahim.id)).toBe('You own it');
    expect(flatSummary(flats)).toBe('5 flats · 1 without an owner');
  });

  it('lets Rahim rename his flat but not Salma’s', async () => {
    const api = setup();
    const rahim = await loginAs(api, 'rahim');
    const flats = await api.listFlats({ building_id: SEED.building });
    const mine = flats.find((f) => f.label === 'A-1')!;
    const salmas = flats.find((f) => f.label === 'B-1')!;
    expect(canRenameFlat(mine, rahim.id)).toBe(true);
    expect(canRenameFlat(salmas, rahim.id)).toBe(false);
    expect((await api.updateFlat({ flat_id: mine.id, label: 'A-9' })).label).toBe('A-9');
    await expect(api.updateFlat({ flat_id: salmas.id, label: 'B-9' })).rejects.toThrow(
      'NOT_ALLOWED',
    );
  });

  it('lets an owner claim an unowned flat, which then reads as theirs', async () => {
    const api = setup();
    const salma = await loginAs(api, 'salma');
    const before = (await api.listFlats({ building_id: SEED.building })).find(
      (f) => f.label === 'C-1',
    )!;
    expect(canClaimFlat(before)).toBe(true);
    await api.claimFlat({ flat_id: before.id });
    const after = (await api.listFlats({ building_id: SEED.building })).find(
      (f) => f.label === 'C-1',
    )!;
    expect(flatOwnerText(after, salma.id)).toBe('You own it');
    expect(canClaimFlat(after)).toBe(false);
  });

  it('does not show flats to a tenant', async () => {
    const api = setup();
    await loginAs(api, 'karima');
    await expect(api.listFlats({ building_id: SEED.building })).rejects.toThrow('NOT_ALLOWED');
  });
});
