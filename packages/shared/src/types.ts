// packages/shared/src/types.ts
//
// The "shapes" of the information the backend sends to the apps.
// These copy Section 3 of docs/api-contract.md exactly. If this file and the
// contract disagree, the contract wins: fix this file. Owned by Shafin.

export type App = 'home' | 'staff';
export type Role = 'owner' | 'tenant' | 'manager' | 'guard';
export type CodeType = 'building' | 'flat' | 'manager' | 'guard';
export type CodeStatus = 'active' | 'disabled' | 'deleted';

export type Account = { id: string; app: App; display_name: string; email: string };

export type Building = {
  id: string;
  name: string;
  address: string;
  contact_info: string;
};

export type Flat = {
  id: string;
  building_id: string;
  label: string;
  /** null means the flat is unclaimed (it has no owner right now). */
  owner: { account_id: string; display_name: string } | null;
};

/** One row per building the person belongs to (active memberships only). */
export type MyMembership = {
  membership_id: string;
  building: { id: string; name: string };
  role: Role;
  /** Only tenants have a flat. */
  flat: { id: string; label: string } | null;
};

export type CodeInfo = {
  id: string;
  type: CodeType;
  value: string;
  /** Only flat codes point at a flat. */
  flat: { id: string; label: string } | null;
  max_uses: number;
  used_count: number;
  remaining: number;
  /** Deleted codes are never returned. */
  status: 'active' | 'disabled';
  created_at: string;
};

export type JoinRequest = {
  request_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  building: { id: string; name: string };
  role: Role;
  flat_label: string | null;
  created_at: string;
};

export type PendingRequestForApprover = {
  request_id: string;
  requester_name: string;
  role: Role;
  flat_label: string | null;
  created_at: string;
};

export type MemberListItem = {
  account_id: string;
  membership_id: string;
  display_name: string;
  role: Role;
  flat_label: string | null;
};

export type ConversationItem = {
  conversation_id: string;
  /** label is a real name, "Former member", or "Deleted account". */
  other: { account_id: string; label: string };
  last_message: { preview: string | null; deleted: boolean; created_at: string } | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_account_id: string;
  /** A real name, "Former member", or "Deleted account". */
  sender_label: string;
  is_mine: boolean;
  /** null when the message was deleted. */
  body: string | null;
  /** When true, show "Message deleted". */
  deleted: boolean;
  created_at: string;
};
