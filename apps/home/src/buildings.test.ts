// apps/home/src/buildings.test.ts
//
// Small checks for the building helpers: role words, the empty-box check on the
// "Create a building" form, and finding one building in my list. They use the
// pretend backend, so no internet is needed. Run with: npm test

import { describe, expect, it } from 'vitest';
import { createFakeApi } from './api/fake/fakeApi';
import { createSeededDatabase, FAKE_PASSWORD, SEED } from './api/fake/seed';
import { checkBuildingForm, hasProblems, loadMembership, roleLabel } from './buildings';

function setup() {
  return createFakeApi({ app: 'home', delayMs: 0, database: createSeededDatabase() });
}

describe('roleLabel', () => {
  it('uses plain words for each role', () => {
    expect(roleLabel({ role: 'owner', flat: null })).toBe('Owner');
    expect(roleLabel({ role: 'manager', flat: null })).toBe('Manager');
    expect(roleLabel({ role: 'guard', flat: null })).toBe('Guard');
  });

  it('adds the flat for a tenant', () => {
    expect(roleLabel({ role: 'tenant', flat: { id: 'f', label: 'A-2' } })).toBe(
      'Tenant · Flat A-2',
    );
    expect(roleLabel({ role: 'tenant', flat: null })).toBe('Tenant');
  });
});

describe('checkBuildingForm', () => {
  it('finds nothing wrong with a full form', () => {
    const problems = checkBuildingForm({
      name: 'Blue Court',
      address: '5 Hill St',
      contactInfo: '017',
    });
    expect(problems).toEqual({});
    expect(hasProblems(problems)).toBe(false);
  });

  it('asks for every empty box, with a plain sentence', () => {
    const problems = checkBuildingForm({ name: '', address: '', contactInfo: '' });
    expect(problems.name).toBe('Please type the building name.');
    expect(problems.address).toBe('Please type the address.');
    expect(problems.contactInfo).toBe('Please type the contact info.');
    expect(hasProblems(problems)).toBe(true);
  });

  it('treats a box with only spaces as empty', () => {
    const problems = checkBuildingForm({ name: '   ', address: 'x', contactInfo: 'y' });
    expect(Object.keys(problems)).toEqual(['name']);
  });
});

describe('loadMembership', () => {
  it('finds a building I belong to, with my role', async () => {
    const api = setup();
    await api.signIn({ email: SEED.emails.karima, password: FAKE_PASSWORD });
    const membership = await loadMembership(api, SEED.building);
    expect(membership).toMatchObject({ role: 'tenant', flat: { label: 'A-2' } });
    expect(membership?.building.name).toBe('Green Tower');
  });

  it('finds nothing for a building I am not in', async () => {
    const api = setup();
    await api.signIn({ email: SEED.emails.nina, password: FAKE_PASSWORD });
    expect(await loadMembership(api, SEED.building)).toBeUndefined();
  });

  it('finds a building right after I create it, as its only owner', async () => {
    const api = setup();
    await api.signIn({ email: SEED.emails.nina, password: FAKE_PASSWORD });
    const building = await api.createBuilding({
      name: 'Blue Court',
      address: '5 Hill Street',
      contact_info: '01800000000',
    });
    const membership = await loadMembership(api, building.id);
    expect(membership).toMatchObject({ role: 'owner', is_last_owner: true });
    expect(roleLabel(membership!)).toBe('Owner');
  });
});
