// apps/home/src/api/fake/fakeApi.test.ts
//
// Small checks that prove the pretend kitchen follows the contract's rules
// (docs/api-contract.md). Run them with: npm test
// Each test starts with a fresh made-up notebook, so tests never affect each other.

import { describe, expect, it } from 'vitest';
import { getErrorCode } from '@griho/shared';
import type { GrihoApi } from '../api';
import { createFakeApi } from './fakeApi';
import { createSeededDatabase, FAKE_PASSWORD, SEED } from './seed';

/** Makes a fresh pretend kitchen with no waiting, plus a handle on its notebook. */
function setup() {
  const database = createSeededDatabase();
  const api = createFakeApi({ app: 'home', delayMs: 0, database });
  return { api, database };
}

/** Logs in as one of the made-up people. */
async function loginAs(api: GrihoApi, person: keyof typeof SEED.emails) {
  return api.signIn({ email: SEED.emails[person], password: FAKE_PASSWORD });
}

/** Runs a call that should fail, and gives back its error code. */
async function errorCodeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return getErrorCode(error as Error);
  }
  return 'NO_ERROR';
}

describe('login and sign-up', () => {
  it('signs up, tags the account as Home, and logs in straight away', async () => {
    const { api } = setup();
    const account = await api.signUp({
      email: 'New.Person@example.com',
      password: 'secret1',
      display_name: ' New Person ',
    });
    expect(account.app).toBe('home');
    expect(account.display_name).toBe('New Person');
    expect(account.email).toBe('new.person@example.com');
    expect((await api.getMyAccount()).id).toBe(account.id);
  });

  it('refuses an email that is already used, even by a Staff account', async () => {
    const { api } = setup();
    await expect(
      api.signUp({ email: SEED.emails.jamal, password: 'secret1', display_name: 'Copycat' }),
    ).rejects.toThrow('User already registered');
  });

  it('refuses a short password or empty name', async () => {
    const { api } = setup();
    expect(
      await errorCodeOf(api.signUp({ email: 'a@b.co', password: '123', display_name: 'A' })),
    ).toBe('INVALID_INPUT');
    expect(
      await errorCodeOf(api.signUp({ email: 'a@b.co', password: '123456', display_name: '  ' })),
    ).toBe('INVALID_INPUT');
  });

  it('refuses a wrong password', async () => {
    const { api } = setup();
    await expect(api.signIn({ email: SEED.emails.rahim, password: 'nope' })).rejects.toThrow(
      'Invalid login credentials',
    );
  });

  it('says NOT_AUTHENTICATED when nobody is logged in', async () => {
    const { api } = setup();
    expect(await errorCodeOf(api.getMyAccount())).toBe('NOT_AUTHENTICATED');
    await loginAs(api, 'rahim');
    await api.signOut();
    expect(await errorCodeOf(api.getMyMemberships())).toBe('NOT_AUTHENTICATED');
  });

  it('lets a Staff account sign in, but shows its app so the screen can sign out', async () => {
    const { api } = setup();
    const account = await loginAs(api, 'jamal');
    expect(account.app).toBe('staff');
    expect(
      await errorCodeOf(api.createBuilding({ name: 'X', address: 'Y', contact_info: 'Z' })),
    ).toBe('WRONG_APP');
  });

  it('keeps push tokens without errors, even when saved twice', async () => {
    const { api, database } = setup();
    await loginAs(api, 'rahim');
    await api.registerPushToken({ token: 'abc', platform: 'android' });
    await api.registerPushToken({ token: 'abc', platform: 'android' });
    expect(database.pushTokens).toHaveLength(1);
    await api.removePushToken({ token: 'abc' });
    expect(database.pushTokens).toHaveLength(0);
  });
});

describe('buildings', () => {
  it('makes the creator the first owner, with no flats and no codes', async () => {
    const { api, database } = setup();
    await loginAs(api, 'nina');
    const building = await api.createBuilding({
      name: ' Blue Court ',
      address: '5 Hill Street',
      contact_info: '01800000000',
    });
    expect(building.name).toBe('Blue Court');
    const memberships = await api.getMyMemberships();
    expect(memberships).toHaveLength(1);
    expect(memberships[0]).toMatchObject({ role: 'owner', is_last_owner: true });
    expect(database.flats.filter((f) => f.buildingId === building.id)).toHaveLength(0);
    expect(database.codes.filter((c) => c.buildingId === building.id)).toHaveLength(0);
  });

  it('refuses empty building details', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    expect(
      await errorCodeOf(api.createBuilding({ name: '', address: 'a', contact_info: 'c' })),
    ).toBe('INVALID_INPUT');
  });

  it('says I am not the last owner when another owner exists', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const memberships = await api.getMyMemberships();
    expect(memberships[0]).toMatchObject({ role: 'owner', is_last_owner: false });
  });

  it('keeps one building invisible to people who are not in it', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    const other = await api.createBuilding({ name: 'Blue Court', address: 'a', contact_info: 'c' });
    await api.signOut();
    await loginAs(api, 'rahim');
    expect(await errorCodeOf(api.getBuilding({ building_id: other.id }))).toBe('NOT_A_MEMBER');
    expect((await api.getBuilding({ building_id: SEED.building })).name).toBe('Green Tower');
  });
});

describe('flats', () => {
  it('lets an owner add a flat and become its owner', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const flat = await api.createFlat({ building_id: SEED.building, label: ' D-4 ' });
    expect(flat.label).toBe('D-4');
    expect(flat.owner?.display_name).toBe('Rahim');
  });

  it('refuses a flat label that is already taken, ignoring capitals and spaces', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    expect(await errorCodeOf(api.createFlat({ building_id: SEED.building, label: ' a-1 ' }))).toBe(
      'FLAT_LABEL_TAKEN',
    );
  });

  it('does not let a tenant or the manager manage flats', async () => {
    const { api } = setup();
    await loginAs(api, 'karima');
    expect(await errorCodeOf(api.createFlat({ building_id: SEED.building, label: 'Z-1' }))).toBe(
      'NOT_ALLOWED',
    );
    expect(await errorCodeOf(api.listFlats({ building_id: SEED.building }))).toBe('NOT_ALLOWED');
    await loginAs(api, 'jamal');
    expect(await errorCodeOf(api.listFlats({ building_id: SEED.building }))).toBe('NOT_ALLOWED');
  });

  it('only lets the flat owner rename it', async () => {
    const { api } = setup();
    await loginAs(api, 'salma');
    expect(await errorCodeOf(api.updateFlat({ flat_id: SEED.flats.a1, label: 'A-9' }))).toBe(
      'NOT_ALLOWED',
    );
    await loginAs(api, 'rahim');
    expect((await api.updateFlat({ flat_id: SEED.flats.a1, label: 'A-9' })).label).toBe('A-9');
    expect(await errorCodeOf(api.updateFlat({ flat_id: SEED.flats.a1, label: 'a-2' }))).toBe(
      'FLAT_LABEL_TAKEN',
    );
  });

  it('lists all flats, including unclaimed ones, in a natural order', async () => {
    const { api } = setup();
    await loginAs(api, 'salma');
    const flats = await api.listFlats({ building_id: SEED.building });
    expect(flats.map((f) => f.label)).toEqual(['A-1', 'A-2', 'B-1', 'C-1']);
    expect(flats.find((f) => f.label === 'C-1')?.owner).toBeNull();
  });

  it('lets an owner claim an unclaimed flat once, and does not bring back old tenants', async () => {
    const { api, database } = setup();
    await loginAs(api, 'salma');
    const tenantsBefore = database.memberships.filter((m) => m.role === 'tenant').length;
    const flat = await api.claimFlat({ flat_id: SEED.flats.c1 });
    expect(flat.owner?.display_name).toBe('Salma');
    expect(await errorCodeOf(api.claimFlat({ flat_id: SEED.flats.c1 }))).toBe('FLAT_NOT_UNCLAIMED');
    expect(database.memberships.filter((m) => m.role === 'tenant')).toHaveLength(tenantsBefore);
  });
});

describe('codes', () => {
  it('lets an owner make codes of every type, starting unused', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const building = await api.createCode({
      building_id: SEED.building,
      type: 'building',
      max_uses: 3,
    });
    expect(building).toMatchObject({ used_count: 0, remaining: 3, status: 'active', flat: null });
    const flat = await api.createCode({
      building_id: SEED.building,
      type: 'flat',
      max_uses: 1,
      flat_id: SEED.flats.a2,
    });
    expect(flat.flat?.label).toBe('A-2');
    expect(building.value).not.toBe(flat.value);
    expect(building.value).toHaveLength(8);
  });

  it('checks the number of uses and the flat', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const base = { building_id: SEED.building, type: 'building' as const };
    expect(await errorCodeOf(api.createCode({ ...base, max_uses: 0 }))).toBe('INVALID_INPUT');
    expect(await errorCodeOf(api.createCode({ ...base, max_uses: 1001 }))).toBe('INVALID_INPUT');
    expect(await errorCodeOf(api.createCode({ ...base, max_uses: 1.5 }))).toBe('INVALID_INPUT');
    expect(await errorCodeOf(api.createCode({ ...base, type: 'flat', max_uses: 1 }))).toBe(
      'INVALID_INPUT',
    );
    expect(
      await errorCodeOf(api.createCode({ ...base, max_uses: 1, flat_id: SEED.flats.a1 })),
    ).toBe('INVALID_INPUT');
    expect((await api.createCode({ ...base, max_uses: 1000 })).max_uses).toBe(1000);
  });

  it('lets the manager make guard codes only', async () => {
    const { api } = setup();
    await loginAs(api, 'jamal');
    const guard = await api.createCode({ building_id: SEED.building, type: 'guard', max_uses: 2 });
    expect(guard.type).toBe('guard');
    expect(
      await errorCodeOf(
        api.createCode({ building_id: SEED.building, type: 'building', max_uses: 2 }),
      ),
    ).toBe('NOT_ALLOWED');
  });

  it('lets owners see every code and the manager see guard codes only', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const ownerView = await api.listCodes({ building_id: SEED.building });
    expect(ownerView.map((c) => c.value).sort()).toEqual(
      [
        SEED.codeValues.owner,
        SEED.codeValues.flatA1,
        SEED.codeValues.manager,
        SEED.codeValues.guard,
        SEED.codeValues.disabled,
      ].sort(),
    );
    await loginAs(api, 'jamal');
    const managerView = await api.listCodes({ building_id: SEED.building });
    expect(managerView.map((c) => c.type)).toEqual(['guard']);
  });

  it('never shows deleted codes and never shows codes to tenants', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const all = await api.listCodes({ building_id: SEED.building });
    expect(all.some((c) => c.value === 'GUARD-GONE')).toBe(false);
    await loginAs(api, 'karima');
    expect(await errorCodeOf(api.listCodes({ building_id: SEED.building }))).toBe('NOT_ALLOWED');
  });

  it('shows the used and remaining counts', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const codes = await api.listCodes({ building_id: SEED.building });
    const owner = codes.find((c) => c.id === SEED.codes.owner);
    expect(owner).toMatchObject({ max_uses: 5, used_count: 2, remaining: 3 });
  });

  it('disables and re-enables a code without removing anyone', async () => {
    const { api, database } = setup();
    await loginAs(api, 'rahim');
    const members = database.memberships.filter((m) => m.status === 'active').length;
    const off = await api.setCodeStatus({ code_id: SEED.codes.owner, status: 'disabled' });
    expect(off).toMatchObject({ status: 'disabled' });
    const on = await api.setCodeStatus({ code_id: SEED.codes.owner, status: 'active' });
    expect(on).toMatchObject({ status: 'active' });
    expect(database.memberships.filter((m) => m.status === 'active')).toHaveLength(members);
  });

  it('deletes a code, hides it, and cancels requests that were waiting on it', async () => {
    const { api, database } = setup();
    await loginAs(api, 'rahim');
    expect(await api.setCodeStatus({ code_id: SEED.codes.flatA1, status: 'deleted' })).toEqual({
      ok: true,
    });
    const codes = await api.listCodes({ building_id: SEED.building });
    expect(codes.some((c) => c.id === SEED.codes.flatA1)).toBe(false);
    expect(database.joinRequests.find((r) => r.id === SEED.joinRequestNina)?.status).toBe(
      'cancelled',
    );
    expect(
      await errorCodeOf(api.setCodeStatus({ code_id: SEED.codes.flatA1, status: 'active' })),
    ).toBe('NOT_FOUND');
  });

  it('keeps codes of other buildings hidden and out of reach', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    expect(
      await errorCodeOf(api.setCodeStatus({ code_id: SEED.codes.owner, status: 'disabled' })),
    ).toBe('NOT_FOUND');
    expect(
      await errorCodeOf(
        api.createCode({ building_id: SEED.building, type: 'building', max_uses: 1 }),
      ),
    ).toBe('NOT_ALLOWED');
  });

  it('only lets the manager change guard codes', async () => {
    const { api } = setup();
    await loginAs(api, 'jamal');
    expect(
      await errorCodeOf(api.setCodeStatus({ code_id: SEED.codes.owner, status: 'disabled' })),
    ).toBe('NOT_ALLOWED');
    expect(
      await api.setCodeStatus({ code_id: SEED.codes.guard, status: 'disabled' }),
    ).toMatchObject({
      status: 'disabled',
    });
  });
});

describe('every dish on the menu', () => {
  it('is built, so none says "not built yet" any more', async () => {
    const { api } = setup();
    for (const name of Object.keys(api) as (keyof GrihoApi)[]) {
      expect(typeof api[name]).toBe('function');
    }
    // Not logged in: a built dish says NOT_AUTHENTICATED, never "not built yet".
    expect(await errorCodeOf(api.listConversations({ building_id: 'x' }))).toBe(
      'NOT_AUTHENTICATED',
    );
  });
});
