import client from "./client";
import type { WishlistItem, NewWishlistItem } from "../types/wishlist";

export async function fetchWishlist(): Promise<WishlistItem[]> {
  return client.request<WishlistItem[]>("wishlist");
}

export async function fetchWishlistItem(id: string): Promise<WishlistItem> {
  return client.request<WishlistItem>(`wishlist/${id}`);
}

export async function createWishlistItem(
  data: NewWishlistItem
): Promise<WishlistItem> {
  return client.request<WishlistItem>("wishlist", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateWishlistItem(
  id: string,
  data: Partial<NewWishlistItem>
): Promise<WishlistItem> {
  return client.request<WishlistItem>(`wishlist/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteWishlistItem(id: string): Promise<void> {
  await client.request<void>(`wishlist/${id}`, {
    method: "DELETE",
    skipJson: true,
  });
}
