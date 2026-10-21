// apps/home/src/people.test.ts
//
// Small checks for the people helpers: who can be removed, the summary lines,
// the typed-name check, and which buildings an exit would delete or just leave.
// Run with: npm test

import { describe, expect, it } from 'vitest';
import type { MemberListItem } from '@griho/shared';
import type { MembershipWithLastOwner } from './api';
import {
  buildingsThatWouldBeDeleted,
  buildingsThatWouldBeLeft,
  canRemove,
  peopleCountSentence,
  peopleSummary,
  splitGuards,
  typedNameMatches,
} from './people';

function person(name: string, role: MemberListItem['role']): MemberListItem {
  return {
    account_id: name,
    membership_id: `m-${name}`,
    display_name: name,
    role,
    flat_label: null,
  };
}

function membership(name: string, isLastOwner: boolean): MembershipWithLastOwner {
  return {
    membership_id: `m-${name}`,
    building: { id: name, name },
    role: 'owner',
    flat: null,
    is_last_owner: isLastOwner,
  };
}

describe('canRemove', () => {
  it('lets owners remove tenants, the manager and guards, but never an owner', () => {
    expect(canRemove('owner', { role: 'tenant' })).toBe(true);
    expect(canRemove('owner', { role: 'manager' })).toBe(true);
    expect(canRemove('owner', { role: 'guard' })).toBe(true);
    expect(canRemove('owner', { role: 'owner' })).toBe(false);
  });

  it('shows no Remove button to tenants', () => {
    expect(canRemove('tenant', { role: 'tenant' })).toBe(false);
    expect(canRemove('tenant', { role: 'guard' })).toBe(false);
  });
});

describe('splitGuards', () => {
  it('separates guards from everyone else', () => {
    const all = [person('Salma', 'owner'), person('Gopal', 'guard'), person('Karima', 'tenant')];
    const { people, guards } = splitGuards(all);
    expect(people.map((p) => p.display_name)).toEqual(['Salma', 'Karima']);
    expect(guards.map((g) => g.display_name)).toEqual(['Gopal']);
  });
});

describe('summary lines', () => {
  const people = [person('Salma', 'owner'), person('Karima', 'tenant'), person('Jamal', 'manager')];
  const guards = [person('Gopal', 'guard')];

  it('counts people and guards', () => {
    expect(peopleSummary(people, guards)).toBe('3 people · 1 guard');
    expect(peopleSummary(people, [])).toBe('3 people');
    expect(peopleSummary([person('A', 'owner')], [])).toBe('1 person');
    expect(peopleSummary([], guards)).toBe('1 guard');
    expect(peopleSummary([], [])).toBe('No one else yet');
  });

  it('writes the sentence under the heading', () => {
    expect(peopleCountSentence(people, guards)).toBe(
      '3 people and 1 guard. You are not in this list.',
    );
    expect(peopleCountSentence(people, [])).toBe('3 people. You are not in this list.');
    expect(peopleCountSentence([], [])).toBe('No other people. You are not in this list.');
  });
});

describe('typedNameMatches', () => {
  it('ignores capital letters and spaces at the ends', () => {
    expect(typedNameMatches('  karima ', 'Karima')).toBe(true);
    expect(typedNameMatches('KARIMA', 'Karima')).toBe(true);
  });

  it('refuses a different or empty name', () => {
    expect(typedNameMatches('Kar', 'Karima')).toBe(false);
    expect(typedNameMatches('', 'Karima')).toBe(false);
    expect(typedNameMatches('', '')).toBe(false);
  });
});

describe('what an exit would do', () => {
  const mine = [membership('Green Tower', true), membership('Blue Court', false)];

  it('names the buildings that would be deleted', () => {
    expect(buildingsThatWouldBeDeleted(mine)).toEqual(['Green Tower']);
  });

  it('names the buildings the person would just leave', () => {
    expect(buildingsThatWouldBeLeft(mine)).toEqual(['Blue Court']);
  });
});
