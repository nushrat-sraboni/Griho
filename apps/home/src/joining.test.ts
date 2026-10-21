// apps/home/src/joining.test.ts
//
// Small checks for the joining helpers: role words, "how long ago", the request
// sentences, and the green messages. Run with: npm test

import { describe, expect, it } from 'vitest';
import {
  checkJoinCode,
  declinedMessage,
  joinedMessage,
  requestStatusLine,
  requestsCountSentence,
  roleWords,
  timeAgo,
  waitingSummary,
} from './joining';

describe('roleWords', () => {
  it('uses plain words, with the flat for a tenant', () => {
    expect(roleWords('owner', null)).toBe('Owner');
    expect(roleWords('manager', null)).toBe('Manager');
    expect(roleWords('guard', null)).toBe('Guard');
    expect(roleWords('tenant', 'A-1')).toBe('Tenant · Flat A-1');
    expect(roleWords('tenant', null)).toBe('Tenant');
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-10-21T12:00:00Z');

  it('says Today, Yesterday and days ago', () => {
    expect(timeAgo('2026-10-21T08:00:00Z', now)).toBe('Today');
    expect(timeAgo('2026-10-20T08:00:00Z', now)).toBe('Yesterday');
    expect(timeAgo('2026-10-19T08:00:00Z', now)).toBe('2 days ago');
  });

  it('says weeks for older requests', () => {
    expect(timeAgo('2026-10-12T08:00:00Z', now)).toBe('1 week ago');
    expect(timeAgo('2026-09-30T08:00:00Z', now)).toBe('3 weeks ago');
  });

  it('never says a time in the future', () => {
    expect(timeAgo('2026-10-22T08:00:00Z', now)).toBe('Today');
  });
});

describe('request sentences', () => {
  it('tells the person what happened to their request', () => {
    expect(requestStatusLine({ status: 'pending' })).toBe('An owner has not answered yet.');
    expect(requestStatusLine({ status: 'approved' })).toBe('An owner said yes. You are in.');
    expect(requestStatusLine({ status: 'rejected' })).toBe('An owner said no.');
    expect(requestStatusLine({ status: 'cancelled' })).toBe('This request was cancelled.');
  });

  it('counts waiting requests', () => {
    expect(waitingSummary(2)).toBe('2 waiting for your answer');
    expect(waitingSummary(0)).toBe('Nothing waiting');
    expect(requestsCountSentence(2)).toBe(
      '2 requests. Anyone who says yes becomes part of the building.',
    );
    expect(requestsCountSentence(1)).toBe(
      '1 request. Anyone who says yes becomes part of the building.',
    );
    expect(requestsCountSentence(0)).toBe('No requests are waiting.');
  });
});

describe('checkJoinCode', () => {
  it('asks for a code when the box is empty or only spaces', () => {
    expect(checkJoinCode('')).toBe('Please type the code.');
    expect(checkJoinCode('   ')).toBe('Please type the code.');
  });

  it('is happy with a code', () => {
    expect(checkJoinCode('A1-TENANT')).toBeUndefined();
  });
});

describe('green messages', () => {
  it('says who joined and as what', () => {
    expect(
      joinedMessage({ requester_name: 'Nina', role: 'tenant', flat_label: 'A-1' }, 'Green Tower'),
    ).toBe('Nina joined Green Tower as a tenant of flat A-1.');
    expect(
      joinedMessage({ requester_name: 'Tahmina', role: 'owner', flat_label: null }, 'Green Tower'),
    ).toBe('Tahmina joined Green Tower as an owner.');
  });

  it('says you said no', () => {
    expect(declinedMessage({ requester_name: 'Omar' })).toBe('You said no to Omar.');
  });
});
