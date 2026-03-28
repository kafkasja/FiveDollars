export type Profile = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  amount: number;
  note?: string;
  created_at: string;
};

export type Balance = {
  debtor: Profile;
  creditor: Profile;
  amount: number;
};
