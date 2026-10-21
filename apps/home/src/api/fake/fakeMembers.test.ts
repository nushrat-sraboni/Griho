// apps/home/src/api/fake/fakeMembers.test.ts
//
// Small checks that prove the pretend kitchen follows the contract's rules for
// joining, people and leaving (docs/api-contract.md, 4.5, 4.6 and 4.1). Each
// test starts with a fresh made-up notebook. Run them with: npm test

import { describe, expect, it } from 'vitest';
import { getErrorCode } from '@griho/shared';
import type { GrihoApi } from '../api';
import { createFakeApi } from './fakeApi';
import { createSeededDatabase, FAKE_PASSWORD, SEED } from './seed';

function setup() {
  const database = createSeededDatabase();
  const api = createFakeApi({ app: 'home', delayMs: 0, database });
  return { api, database };
}

async function loginAs(api: GrihoApi, person: keyof typeof SEED.emails) {
  return api.signIn({ email: SEED.emails[person], password: FAKE_PASSWORD });
}

async function errorCodeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return getErrorCode(error as Error);
  }
  return 'NO_ERROR';
}

describe('typing a join code', () => {
  it('sends a waiting request and does NOT use up the code', async () => {
    const { api, database } = setup();
    await loginAs(api, 'nina');
    const result = await api.submitJoinRequest({ code_value: ' green-owner ' });
    expect(result).toMatchObject({
      building_name: 'Green Tower',
      role: 'owner',
      status: 'pending',
    });
    expect(database.codes.find((c) => c.id === SEED.codes.owner)?.usedCount).toBe(2);
  });

  it('takes the role and flat from the code, not from the person', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    // Nina already has a waiting request on this code, so use the second flat code route: a fresh code.
    await loginAs(api, 'rahim');
    const code = await api.createCode({
      building_id: SEED.building,
      type: 'flat',
      max_uses: 1,
      flat_id: SEED.flats.b1,
    });
    await loginAs(api, 'nina');
    const result = await api.submitJoinRequest({ code_value: code.value });
    expect(result).toMatchObject({ role: 'tenant', flat_label: 'B-1' });
  });

  it('gives ONE error for a code that does not exist, is turned off, or is deleted', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    expect(await errorCodeOf(api.submitJoinRequest({ code_value: 'NOPE' }))).toBe(
      'CODE_NOT_USABLE',
    );
    expect(await errorCodeOf(api.submitJoinRequest({ code_value: 'b1-old' }))).toBe(
      'CODE_NOT_USABLE',
    );
    expect(await errorCodeOf(api.submitJoinRequest({ code_value: 'GUARD-GONE' }))).toBe(
      'CODE_NOT_USABLE',
    );
  });

  it('says a used-up code is used up', async () => {
    const { api, database } = setup();
    database.codes.find((c) => c.id === SEED.codes.owner)!.usedCount = 5;
    await loginAs(api, 'nina');
    expect(await errorCodeOf(api.submitJoinRequest({ code_value: 'GREEN-OWNER' }))).toBe(
      'CODE_USED_UP',
    );
  });

  it('sends a Home account away from Staff codes (manager and guard)', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    expect(await errorCodeOf(api.submitJoinRequest({ code_value: 'GREEN-GUARD' }))).toBe(
      'WRONG_APP',
    );
  });

  it('refuses people already in the building, and a second waiting request', async () => {
    const { api } = setup();
    await loginAs(api, 'karima');
    expect(await errorCodeOf(api.submitJoinRequest({ code_value: 'GREEN-OWNER' }))).toBe(
      'ALREADY_MEMBER',
    );
    await loginAs(api, 'nina');
    // Nina already has a waiting request on A1-TENANT in the seed.
    expect(await errorCodeOf(api.submitJoinRequest({ code_value: 'A1-TENANT' }))).toBe(
      'ALREADY_PENDING',
    );
  });

  it('stops after 8 tries in a short time', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    for (let i = 0; i < 8; i += 1) {
      expect(await errorCodeOf(api.submitJoinRequest({ code_value: `WRONG${i}` }))).toBe(
        'CODE_NOT_USABLE',
      );
    }
    expect(await errorCodeOf(api.submitJoinRequest({ code_value: 'GREEN-OWNER' }))).toBe(
      'TOO_MANY_ATTEMPTS',
    );
  });

  it('lists my own requests, newest first', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    await api.submitJoinRequest({ code_value: 'GREEN-OWNER' });
    const mine = await api.listMyJoinRequests();
    expect(mine.map((r) => r.role)).toEqual(['owner', 'tenant']);
    expect(mine.every((r) => r.status === 'pending')).toBe(true);
  });
});

describe('answering requests', () => {
  it('shows owners the requests they can answer, oldest first, and the manager only guard ones', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const pending = await api.listPendingJoinRequests({ building_id: SEED.building });
    expect(pending.map((r) => r.requester_name)).toEqual(['Nina']);
    await loginAs(api, 'jamal');
    expect(await api.listPendingJoinRequests({ building_id: SEED.building })).toEqual([]);
    await loginAs(api, 'karima');
    expect(await errorCodeOf(api.listPendingJoinRequests({ building_id: SEED.building }))).toBe(
      'NOT_ALLOWED',
    );
  });

  it('uses up one slot, and makes the person a member, ONLY when approved', async () => {
    const { api, database } = setup();
    await loginAs(api, 'rahim');
    const answer = await api.decideJoinRequest({
      request_id: SEED.joinRequestNina,
      decision: 'approve',
    });
    expect(answer.status).toBe('approved');
    expect(database.codes.find((c) => c.id === SEED.codes.flatA1)?.usedCount).toBe(1);
    await loginAs(api, 'nina');
    const memberships = await api.getMyMemberships();
    expect(memberships[0]).toMatchObject({ role: 'tenant', flat: { label: 'A-1' } });
  });

  it('uses nothing up when rejected', async () => {
    const { api, database } = setup();
    await loginAs(api, 'salma');
    await api.decideJoinRequest({ request_id: SEED.joinRequestNina, decision: 'reject' });
    expect(database.codes.find((c) => c.id === SEED.codes.flatA1)?.usedCount).toBe(0);
    await loginAs(api, 'nina');
    expect(await api.getMyMemberships()).toEqual([]);
  });

  it('lets the first answer win', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    await api.decideJoinRequest({ request_id: SEED.joinRequestNina, decision: 'approve' });
    await loginAs(api, 'salma');
    expect(
      await errorCodeOf(
        api.decideJoinRequest({ request_id: SEED.joinRequestNina, decision: 'reject' }),
      ),
    ).toBe('REQUEST_ALREADY_DECIDED');
  });

  it('fails with CODE_USED_UP if the code ran out while the request waited', async () => {
    const { api, database } = setup();
    database.codes.find((c) => c.id === SEED.codes.flatA1)!.usedCount = 1;
    await loginAs(api, 'rahim');
    expect(
      await errorCodeOf(
        api.decideJoinRequest({ request_id: SEED.joinRequestNina, decision: 'approve' }),
      ),
    ).toBe('CODE_USED_UP');
  });

  it('still lets a waiting request be approved after its code was turned off', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    await api.setCodeStatus({ code_id: SEED.codes.flatA1, status: 'disabled' });
    const answer = await api.decideJoinRequest({
      request_id: SEED.joinRequestNina,
      decision: 'approve',
    });
    expect(answer.status).toBe('approved');
  });

  it('does not let a tenant or an outsider answer', async () => {
    const { api } = setup();
    await loginAs(api, 'karima');
    expect(
      await errorCodeOf(
        api.decideJoinRequest({ request_id: SEED.joinRequestNina, decision: 'approve' }),
      ),
    ).toBe('NOT_ALLOWED');
  });
});

describe('the people list', () => {
  it('shows other owners, the manager and tenants, never guards or me', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const people = await api.listMembers({ building_id: SEED.building });
    expect(people.map((p) => [p.display_name, p.role])).toEqual([
      ['Salma', 'owner'],
      ['Jamal', 'manager'],
      ['Karima', 'tenant'],
    ]);
    expect(people.find((p) => p.display_name === 'Karima')?.flat_label).toBe('A-2');
  });

  it('keeps the member list from guards and outsiders', async () => {
    const { api } = setup();
    await loginAs(api, 'gopal');
    expect(await errorCodeOf(api.listMembers({ building_id: SEED.building }))).toBe('NOT_ALLOWED');
    await loginAs(api, 'nina');
    expect(await errorCodeOf(api.listMembers({ building_id: SEED.building }))).toBe('NOT_A_MEMBER');
  });

  it('shows the guards to owners and the manager only', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    expect(
      (await api.listGuards({ building_id: SEED.building })).map((g) => g.display_name),
    ).toEqual(['Gopal']);
    await loginAs(api, 'karima');
    expect(await errorCodeOf(api.listGuards({ building_id: SEED.building }))).toBe('NOT_ALLOWED');
  });
});

describe('removing a person', () => {
  it('lets an owner remove a tenant after the typed name matches', async () => {
    const { api, database } = setup();
    await loginAs(api, 'rahim');
    expect(
      await errorCodeOf(
        api.removeMember({ membership_id: SEED.memberships.karima, typed_name: 'Kar' }),
      ),
    ).toBe('TYPED_NAME_MISMATCH');
    await api.removeMember({ membership_id: SEED.memberships.karima, typed_name: '  KARIMA ' });
    expect(database.memberships.find((m) => m.id === SEED.memberships.karima)?.status).toBe(
      'removed',
    );
    await loginAs(api, 'karima');
    expect(await api.getMyMemberships()).toEqual([]);
  });

  it('never lets anyone remove an owner', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    expect(
      await errorCodeOf(
        api.removeMember({ membership_id: SEED.memberships.salma, typed_name: 'Salma' }),
      ),
    ).toBe('NOT_ALLOWED');
  });

  it('lets an owner and the manager remove a guard, but not a tenant (manager)', async () => {
    const { api } = setup();
    await loginAs(api, 'jamal');
    expect(
      await errorCodeOf(
        api.removeMember({ membership_id: SEED.memberships.karima, typed_name: 'Karima' }),
      ),
    ).toBe('NOT_ALLOWED');
    await api.removeMember({ membership_id: SEED.memberships.gopal, typed_name: 'Gopal' });
    await loginAs(api, 'rahim');
    expect(await api.listGuards({ building_id: SEED.building })).toEqual([]);
  });

  it('does not reveal people of other buildings', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    expect(
      await errorCodeOf(
        api.removeMember({ membership_id: SEED.memberships.karima, typed_name: 'Karima' }),
      ),
    ).toBe('NOT_FOUND');
  });
});

describe('leaving a building', () => {
  it('lets a tenant leave after typing their name', async () => {
    const { api } = setup();
    await loginAs(api, 'karima');
    expect(
      await errorCodeOf(api.leaveBuilding({ building_id: SEED.building, typed_name: 'nope' })),
    ).toBe('TYPED_NAME_MISMATCH');
    expect(await api.leaveBuilding({ building_id: SEED.building, typed_name: 'karima' })).toEqual({
      result: 'left',
    });
    expect(await api.getMyMemberships()).toEqual([]);
  });

  it('makes an owner’s flats unclaimed and removes their tenants, when other owners stay', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    expect(await api.leaveBuilding({ building_id: SEED.building, typed_name: 'Rahim' })).toEqual({
      result: 'left',
    });
    await loginAs(api, 'salma');
    const flats = await api.listFlats({ building_id: SEED.building });
    expect(flats.find((f) => f.label === 'A-1')?.owner).toBeNull();
    expect(flats.find((f) => f.label === 'A-2')?.owner).toBeNull();
    expect(flats.find((f) => f.label === 'B-1')?.owner?.display_name).toBe('Salma');
    await loginAs(api, 'karima');
    expect(await api.getMyMemberships()).toEqual([]); // Karima lost access with A-2.
  });

  it('deletes the whole building when the LAST owner leaves', async () => {
    const { api, database } = setup();
    await loginAs(api, 'rahim');
    await api.leaveBuilding({ building_id: SEED.building, typed_name: 'Rahim' });
    await loginAs(api, 'salma');
    expect((await api.getMyMemberships())[0]).toMatchObject({ is_last_owner: true });
    expect(await api.leaveBuilding({ building_id: SEED.building, typed_name: 'Salma' })).toEqual({
      result: 'building_deleted',
    });
    expect(database.buildings).toHaveLength(0);
    expect(database.flats).toHaveLength(0);
    expect(database.codes).toHaveLength(0);
    expect(database.joinRequests).toHaveLength(0);
    expect(database.messages).toHaveLength(0);
    expect(database.memberships).toHaveLength(0);
  });

  it('says NOT_A_MEMBER for a building I am not in', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    expect(
      await errorCodeOf(api.leaveBuilding({ building_id: SEED.building, typed_name: 'Nina' })),
    ).toBe('NOT_A_MEMBER');
  });
});

describe('deleting an account', () => {
  it('needs the typed name', async () => {
    const { api } = setup();
    await loginAs(api, 'karima');
    expect(await errorCodeOf(api.deleteAccount({ typed_name: 'someone' }))).toBe(
      'TYPED_NAME_MISMATCH',
    );
  });

  it('leaves every building, wipes the account, and frees the email', async () => {
    const { api, database } = setup();
    await loginAs(api, 'karima');
    expect(await api.deleteAccount({ typed_name: 'Karima' })).toEqual({
      ok: true,
      buildings_deleted: 0,
    });
    expect(database.accounts.find((a) => a.id === SEED.accounts.karima)).toMatchObject({
      deleted: true,
      displayName: 'Deleted account',
    });
    expect(await errorCodeOf(api.getMyAccount())).toBe('NOT_AUTHENTICATED');
    await expect(
      api.signIn({ email: SEED.emails.karima, password: FAKE_PASSWORD }),
    ).rejects.toThrow('Invalid login credentials');
    // The email can be used for a new account again.
    expect(
      (await api.signUp({ email: SEED.emails.karima, password: 'secret1', display_name: 'New' }))
        .email,
    ).toBe(SEED.emails.karima);
  });

  it('deletes buildings where the person is the last owner, and counts them', async () => {
    const { api } = setup();
    await loginAs(api, 'nina');
    const building = await api.createBuilding({ name: 'Solo', address: 'a', contact_info: 'c' });
    expect((await api.getMyMemberships())[0]).toMatchObject({ is_last_owner: true });
    expect(await api.deleteAccount({ typed_name: 'Nina' })).toEqual({
      ok: true,
      buildings_deleted: 1,
    });
    await loginAs(api, 'rahim');
    await expect(api.getBuilding({ building_id: building.id })).rejects.toThrow('NOT_A_MEMBER');
  });

  it('cancels requests that were still waiting', async () => {
    const { api, database } = setup();
    await loginAs(api, 'nina');
    await api.deleteAccount({ typed_name: 'Nina' });
    expect(database.joinRequests.find((r) => r.id === SEED.joinRequestNina)?.status).toBe(
      'cancelled',
    );
  });
});
