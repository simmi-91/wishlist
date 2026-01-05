import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/wishlist";
import type { NewWishlistItem, WishlistItem } from "../types/wishlist";

const QUERY_KEY = ["wishlist"] as const;

export function useWishlist() {
  return useQuery<WishlistItem[]>({
    queryKey: QUERY_KEY,
    queryFn: api.fetchWishlist,
  });
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewWishlistItem) => api.createWishlistItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<NewWishlistItem>;
    }) => api.updateWishlistItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteWishlistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
