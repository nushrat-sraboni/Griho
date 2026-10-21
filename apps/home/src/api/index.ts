// apps/home/src/api/index.ts
//
// THE ONE SWITCH. Every screen imports `api` from here:
//   import { api } from '../api';
// Today `api` is the pretend kitchen. When Shafin's real backend wrappers are
// ready in packages/shared, change the one line below and no screen changes.
// Owned by Bishal.

import type { GrihoApi } from './api';
import { createFakeApi } from './fake/fakeApi';

export type {
  DeleteAccountResult,
  GrihoApi,
  LeaveBuildingResult,
  MembershipWithLastOwner,
  Ok,
  SubmitJoinRequestResult,
} from './api';

export const api: GrihoApi = createFakeApi({ app: 'home' });
