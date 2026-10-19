// apps/home/src/codes.test.ts
//
// Small checks for the join-code helpers: the words for each kind and state of
// code, the summary lines, the "Make a code" form checks, and the whole make,
// turn off and delete flow on the pretend backend. Run with: npm test

import { describe, expect, it } from 'vitest';
import type { CodeInfo } from '@griho/shared';
import { createFakeApi } from './api/fake/fakeApi';
import { createSeededDatabase, FAKE_PASSWORD, SEED } from './api/fake/seed';
import {
  checkCodeForm,
  codesCountSentence,
  codesSummary,
  codeStatus,
  codeTypeLabel,
  leftText,
  parseMaxUses,
  shareMessage,
  usedText,
  usesLeftText,
} from './codes';

function code(partial: Partial<CodeInfo>): CodeInfo {
  return {
    id: 'c',
    type: 'building',
    value: 'ABC12345',
    flat: null,
    max_uses: 5,
    used_count: 2,
    remaining: 3,
    status: 'active',
    created_at: '2026-10-01T09:00:00Z',
    ...partial,
  };
}

function setup() {
  return createFakeApi({ app: 'home', delayMs: 0, database: createSeededDatabase() });
}

async function loginAs(api: ReturnType<typeof setup>, person: keyof typeof SEED.emails) {
  return api.signIn({ email: SEED.emails[person], password: FAKE_PASSWORD });
}

describe('the words for a code', () => {
  it('names each kind of code', () => {
    expect(codeTypeLabel(code({ type: 'building' }))).toBe('Building code');
    expect(codeTypeLabel(code({ type: 'manager' }))).toBe('Manager code');
    expect(codeTypeLabel(code({ type: 'guard' }))).toBe('Guard code');
    expect(codeTypeLabel(code({ type: 'flat', flat: { id: 'f', label: 'A-1' } }))).toBe(
      'Flat code · A-1',
    );
  });

  it('says whether a code is active, turned off or used up', () => {
    expect(codeStatus(code({}))).toEqual({ text: 'Active', tone: 'active' });
    expect(codeStatus(code({ status: 'disabled' }))).toEqual({ text: 'Turned off', tone: 'off' });
    expect(codeStatus(code({ used_count: 5, remaining: 0 }))).toEqual({
      text: 'Used up',
      tone: 'usedUp',
    });
  });

  it('says turned off even when the code is also used up', () => {
    expect(codeStatus(code({ status: 'disabled', used_count: 5, remaining: 0 })).text).toBe(
      'Turned off',
    );
  });

  it('writes the uses in plain words', () => {
    expect(usesLeftText(code({}))).toBe('3 of 5 uses left');
    expect(usesLeftText(code({ max_uses: 1, used_count: 0, remaining: 1 }))).toBe(
      '1 of 1 use left',
    );
    expect(usedText(code({}))).toBe('2 of 5');
    expect(leftText(code({}))).toBe('3 uses');
    expect(leftText(code({ remaining: 1 }))).toBe('1 use');
  });

  it('makes a share message with the code and the building name', () => {
    expect(shareMessage(code({ value: 'K7M4QX2P' }), 'Green Tower')).toBe(
      'Join Green Tower on Griho. Your code is K7M4QX2P.',
    );
  });
});

describe('summary lines', () => {
  it('counts codes and turned-off codes', () => {
    const codes = [code({}), code({}), code({ status: 'disabled' })];
    expect(codesSummary(codes)).toBe('3 codes · 1 turned off');
    expect(codesCountSentence(codes)).toBe(
      '3 codes in this building. Tap one to share it or turn it off.',
    );
  });

  it('handles none, one, and no turned-off codes', () => {
    expect(codesSummary([])).toBe('No codes yet');
    expect(codesCountSentence([])).toBe('No codes yet.');
    expect(codesSummary([code({})])).toBe('1 code');
  });
});

describe('parseMaxUses', () => {
  it('accepts whole numbers from 1 to 1000', () => {
    expect(parseMaxUses('1')).toEqual({ value: 1 });
    expect(parseMaxUses(' 25 ')).toEqual({ value: 25 });
    expect(parseMaxUses('1000')).toEqual({ value: 1000 });
  });

  it('refuses empty, zero, too many, decimals and words', () => {
    expect(parseMaxUses('').problem).toBe('Please type how many people can use the code.');
    for (const bad of ['0', '1001', '1.5', '-3', 'ten']) {
      expect(parseMaxUses(bad).problem).toBe('Please type a whole number from 1 to 1000.');
    }
  });
});

describe('checkCodeForm', () => {
  it('needs a flat for a flat code', () => {
    const result = checkCodeForm({ type: 'flat', flatId: null, usesText: '1' });
    expect(result.problems.flat).toBe('Please pick a flat.');
    expect(checkCodeForm({ type: 'flat', flatId: 'f1', usesText: '1' }).problems).toEqual({});
  });

  it('does not need a flat for other kinds', () => {
    const result = checkCodeForm({ type: 'building', flatId: null, usesText: '3' });
    expect(result.problems).toEqual({});
    expect(result.maxUses).toBe(3);
  });

  it('reports a bad number of uses', () => {
    expect(
      checkCodeForm({ type: 'guard', flatId: null, usesText: 'x' }).problems.uses,
    ).toBeTruthy();
  });
});

describe('the make, turn off and delete flow on the pretend backend', () => {
  it('makes a flat code that starts active and unused', async () => {
    const api = setup();
    await loginAs(api, 'rahim');
    const made = await api.createCode({
      building_id: SEED.building,
      type: 'flat',
      max_uses: 2,
      flat_id: SEED.flats.a2,
    });
    expect(codeTypeLabel(made)).toBe('Flat code · A-2');
    expect(codeStatus(made).text).toBe('Active');
    expect(usesLeftText(made)).toBe('2 of 2 uses left');
  });

  it('turns a code off and on again, and shows that in the list', async () => {
    const api = setup();
    await loginAs(api, 'rahim');
    const off = (await api.setCodeStatus({
      code_id: SEED.codes.owner,
      status: 'disabled',
    })) as CodeInfo;
    expect(codeStatus(off).text).toBe('Turned off');
    const list = await api.listCodes({ building_id: SEED.building });
    expect(codesSummary(list)).toBe('5 codes · 2 turned off');
    const on = (await api.setCodeStatus({
      code_id: SEED.codes.owner,
      status: 'active',
    })) as CodeInfo;
    expect(codeStatus(on).text).toBe('Active');
  });

  it('shows the seeded manager code as used up', async () => {
    const api = setup();
    await loginAs(api, 'rahim');
    const list = await api.listCodes({ building_id: SEED.building });
    const manager = list.find((c) => c.id === SEED.codes.manager)!;
    expect(codeStatus(manager).text).toBe('Used up');
    expect(usesLeftText(manager)).toBe('0 of 1 use left');
  });

  it('removes a deleted code from the list', async () => {
    const api = setup();
    await loginAs(api, 'rahim');
    await api.setCodeStatus({ code_id: SEED.codes.guard, status: 'deleted' });
    const list = await api.listCodes({ building_id: SEED.building });
    expect(list.some((c) => c.id === SEED.codes.guard)).toBe(false);
    expect(codesSummary(list)).toBe('4 codes · 1 turned off');
  });

  it('does not show codes to a tenant', async () => {
    const api = setup();
    await loginAs(api, 'karima');
    await expect(api.listCodes({ building_id: SEED.building })).rejects.toThrow('NOT_ALLOWED');
  });
});
