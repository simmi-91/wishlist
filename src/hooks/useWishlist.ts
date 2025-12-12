import { useQuery } from "@tanstack/react-query";
import * as api from "../api/wishlist";
import type { WishlistItem } from "../types/wishlist";

const QUERY_KEY = ["wishlist"] as const;

export function useWishlist() {
  return useQuery<WishlistItem[]>({
    queryKey: QUERY_KEY,
    queryFn: api.fetchWishlist,
  });
}

export function useCreateWishlistItem() {}

export function useUpdateWishlistItem() {}

export function useDeleteWishlistItem() {}
