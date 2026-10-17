// apps/home/src/buildings.ts
//
// Small pieces of "building" know-how, kept apart from the screens so they can
// be tested:
//   - roleLabel: the words shown for a person's role ("Owner", "Tenant · Flat A-2")
//   - checkBuildingForm: what to say when a box on the "Create a building" form
//     is empty (the backend checks too; this just gives faster, friendlier help)
//   - loadMembership: finds one building in the person's own list
// Owned by Bishal.

import type { GrihoApi, MembershipWithLastOwner } from './api';

/** The words shown for a person's role in a building. */
export function roleLabel(membership: Pick<MembershipWithLastOwner, 'role' | 'flat'>): string {
  switch (membership.role) {
    case 'owner':
      return 'Owner';
    case 'tenant':
      return membership.flat ? `Tenant · Flat ${membership.flat.label}` : 'Tenant';
    case 'manager':
      return 'Manager';
    case 'guard':
      return 'Guard';
  }
}

export type BuildingForm = { name: string; address: string; contactInfo: string };

/** One short sentence for each box that needs fixing. A box that is fine has no entry. */
export type BuildingFormProblems = { name?: string; address?: string; contactInfo?: string };

/** Looks at the "Create a building" form and says which boxes are empty. */
export function checkBuildingForm(form: BuildingForm): BuildingFormProblems {
  const problems: BuildingFormProblems = {};
  if (!form.name.trim()) problems.name = 'Please type the building name.';
  if (!form.address.trim()) problems.address = 'Please type the address.';
  if (!form.contactInfo.trim()) problems.contactInfo = 'Please type the contact info.';
  return problems;
}

/** True when at least one box needs fixing. */
export function hasProblems(problems: BuildingFormProblems): boolean {
  return Object.keys(problems).length > 0;
}

/** Finds one building in my own list, or undefined when I am not in it. */
export async function loadMembership(
  api: GrihoApi,
  buildingId: string,
): Promise<MembershipWithLastOwner | undefined> {
  const memberships = await api.getMyMemberships();
  return memberships.find((m) => m.building.id === buildingId);
}
