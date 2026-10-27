import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/giftlog";
import type {
  Gift,
  GiftFilters,
  GiftSummary,
  MarkGiven,
  NewGift,
  NewOccasion,
  NewPerson,
  Occasion,
  Person,
  UpdateGift,
  UpdatePerson,
} from "../types/giftlog.ts";
import type { PersonRef } from "../components/PersonPicker";
import { findByName } from "../utils/giftlog.ts";

// Every mutation invalidates GIFTLOG_KEY: gifts, years, summary, persons
// and occasions all show data from each other (names, totals, years)
export const GIFTLOG_KEY = ["giftlog"] as const;
export const GIFTS_KEY = [...GIFTLOG_KEY, "gifts"] as const;
export const YEARS_KEY = [...GIFTLOG_KEY, "years"] as const;
export const SUMMARY_KEY = [...GIFTLOG_KEY, "summary"] as const;
export const PERSONS_KEY = [...GIFTLOG_KEY, "persons"] as const;
export const OCCASIONS_KEY = [...GIFTLOG_KEY, "occasions"] as const;

// Year / summary
export function useGiftYears() {
  return useQuery<number[]>({
    queryKey: YEARS_KEY,
    queryFn: api.fetchYears,
  });
}

export function useGiftSummary() {
  return useQuery<GiftSummary>({
    queryKey: SUMMARY_KEY,
    queryFn: api.fetchSummary,
  });
}

// Gifts
// Keeps showing the previous list while new filters load, so the page doesn't jump
export function useGifts(filters: GiftFilters = {}) {
  return useQuery<Gift[]>({
    queryKey: [...GIFTS_KEY, "list", filters],
    queryFn: () => api.fetchGifts(filters),
    placeholderData: keepPreviousData,
  });
}

export function useGift(id: number | undefined) {
  return useQuery<Gift>({
    queryKey: [...GIFTS_KEY, "detail", id],
    queryFn: () => api.fetchGift(id!),
    enabled: id !== undefined,
  });
}

export function useCreateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewGift) => api.createGift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

export function useUpdateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGift }) =>
      api.updateGift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

export function useDeleteGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteGift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

export function useMarkGiftGiven() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarkGiven) => api.markGiftGiven(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

// Persons
export function usePersons() {
  return useQuery<Person[]>({
    queryKey: PERSONS_KEY,
    queryFn: api.fetchPersons,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewPerson) => api.createPerson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePerson }) =>
      api.updatePerson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

// Occasions
export function useOccasions() {
  return useQuery<Occasion[]>({
    queryKey: OCCASIONS_KEY,
    queryFn: api.fetchOccasions,
  });
}

export function useCreateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewOccasion) => api.createOccasion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

export function useUpdateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NewOccasion }) =>
      api.updateOccasion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

export function useDeleteOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteOccasion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIFTLOG_KEY });
    },
  });
}

// Everything not given yet, whatever the year
export function usePendingGifts() {
  const queries = [
    useGifts({ status: "idea" }),
    useGifts({ status: "bought" }),
    useGifts({ status: "sent" }),
  ];

  return {
    data: queries.flatMap((query) => query.data ?? []),
    isLoading: queries.some((query) => query.isLoading),
  };
}

// Turns typed-in names into ids, saving new persons and occasions first
export function useResolveGiftRefs() {
  const { data: persons = [] } = usePersons();
  const { data: occasions = [] } = useOccasions();
  const createPerson = useCreatePerson();
  const createOccasion = useCreateOccasion();

  // One id list per person list; the same new name in several lists is created once
  const resolvePersons = async (...lists: PersonRef[][]) => {
    const createdIds = new Map<string, number>();
    const resolve = async (ref: PersonRef) => {
      const id = ref.id ?? findByName(persons, ref.name)?.id;
      if (id !== undefined) {
        return id;
      }
      const key = ref.name.toLocaleLowerCase("nb");
      if (!createdIds.has(key)) {
        const created = await createPerson.mutateAsync({ name: ref.name });
        createdIds.set(key, created.id);
      }
      return createdIds.get(key)!;
    };

    const result: number[][] = [];
    for (const list of lists) {
      const ids: number[] = [];
      for (const ref of list) {
        ids.push(await resolve(ref));
      }
      result.push(ids);
    }
    return result;
  };

  // null when no occasion is given
  const resolveOccasion = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }
    return (
      findByName(occasions, trimmed)?.id ??
      (await createOccasion.mutateAsync({ name: trimmed })).id
    );
  };

  return { resolvePersons, resolveOccasion };
}
