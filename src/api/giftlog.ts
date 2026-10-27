import client from "./client";
import type {
  Gift,
  GiftFilters,
  GiftSummary,
  MarkGiven,
  MessageResponse,
  NewGift,
  NewOccasion,
  NewPerson,
  Occasion,
  Person,
  UpdateGift,
  UpdatePerson,
} from "../types/giftlog.ts";

function toQueryString(filters: GiftFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

// Year / summary
export async function fetchYears(): Promise<number[]> {
  return client.request<number[]>("giftlog/years");
}

export async function fetchSummary(): Promise<GiftSummary> {
  return client.request<GiftSummary>("giftlog/summary");
}

// Gifts
export async function fetchGifts(filters: GiftFilters = {}): Promise<Gift[]> {
  return client.request<Gift[]>(`giftlog/gifts${toQueryString(filters)}`);
}

export async function fetchGift(id: number): Promise<Gift> {
  return client.request<Gift>(`giftlog/gifts/${id}`);
}

export async function createGift(data: NewGift): Promise<Gift> {
  return client.request<Gift>("giftlog/gifts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateGift(
  id: number,
  data: UpdateGift
): Promise<MessageResponse> {
  return client.request<MessageResponse>(`giftlog/gifts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteGift(id: number): Promise<Gift> {
  return client.request<Gift>(`giftlog/gifts/${id}`, {
    method: "DELETE",
  });
}

export async function markGiftGiven(data: MarkGiven): Promise<MessageResponse> {
  return client.request<MessageResponse>("giftlog/gifts/mark-given", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Persons
export async function fetchPersons(): Promise<Person[]> {
  return client.request<Person[]>("giftlog/persons");
}

// is_household is only in the response when it was sent
export async function createPerson(
  data: NewPerson
): Promise<Pick<Person, "id" | "name"> & { is_household?: boolean }> {
  return client.request("giftlog/persons", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePerson(
  id: number,
  data: UpdatePerson
): Promise<MessageResponse> {
  return client.request<MessageResponse>(`giftlog/persons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePerson(id: number): Promise<Person> {
  return client.request<Person>(`giftlog/persons/${id}`, {
    method: "DELETE",
  });
}

// Occasions
export async function fetchOccasions(): Promise<Occasion[]> {
  return client.request<Occasion[]>("giftlog/occasions");
}

export async function createOccasion(data: NewOccasion): Promise<Occasion> {
  return client.request<Occasion>("giftlog/occasions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOccasion(
  id: number,
  data: NewOccasion
): Promise<MessageResponse> {
  return client.request<MessageResponse>(`giftlog/occasions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteOccasion(id: number): Promise<Occasion> {
  return client.request<Occasion>(`giftlog/occasions/${id}`, {
    method: "DELETE",
  });
}
