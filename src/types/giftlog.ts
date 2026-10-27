export type GiftStatus = "idea" | "bought" | "sent" | "given";
export type GiftRole = "giver" | "recipient";

export type GiftPerson = {
  id: number;
  name: string;
};

export type Gift = {
  id: number;
  title: string | null;
  description: string | null;
  year: number | null;
  date_given: string | null; // YYYY-MM-DD
  occasion_id: number | null;
  status: GiftStatus;
  price: number | null;
  created_at: string | null;
  updated_at: string | null;
  givers: GiftPerson[];
  recipients: GiftPerson[];
};

// PATCH requires every field (null is allowed)
export type UpdateGift = Pick<
  Gift,
  "title" | "description" | "year" | "date_given" | "occasion_id" | "status" | "price"
> & {
  giver_ids: number[];
  recipient_ids: number[];
};

// POST only requires the person lists; status defaults to "given"
export type NewGift = Partial<UpdateGift> &
  Pick<UpdateGift, "giver_ids" | "recipient_ids">;

export type MarkGiven = {
  id: number;
  date_given?: string; // defaults to today
};

export type GiftFilters = {
  year?: number;
  occasion_id?: number;
  status?: GiftStatus; // without status, ideas are left out
  person_id?: number;
  role?: GiftRole;
  q?: string;
};

export type Person = {
  id: number;
  name: string;
  is_household: number; // 0 | 1
};

export type NewPerson = {
  name: string;
  is_household?: boolean;
};

export type UpdatePerson = Required<NewPerson>;

export type Occasion = {
  id: number;
  name: string;
};

export type NewOccasion = Pick<Occasion, "name">;

export type SummaryTotals = {
  count: number;
  total: number;
};

export type DirectionTotals = {
  given: SummaryTotals;
  received: SummaryTotals;
};

export type GiftSummary = {
  years: (DirectionTotals & {
    year: number;
    occasions: (DirectionTotals & Occasion)[];
    // id is null for "Felles" (more than one household person on the same side), always last
    persons: (DirectionTotals & { id: number | null; name: string })[];
  })[];
  byStatus: (SummaryTotals & { status: GiftStatus })[];
};

export type MessageResponse = {
  message: string;
};
