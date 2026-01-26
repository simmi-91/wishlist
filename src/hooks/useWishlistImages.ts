import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/wishlistImage";
import type {
  UploadImageFile,
  AttachImageFromUrl,
} from "../types/wishlistImage";
import { QUERY_KEY } from "./useWishlist";

export function useUploadNewImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wishId, data }: { wishId: number; data: UploadImageFile }) =>
      api.uploadNewImage(wishId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useAttachImageFromUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      wishId,
      data,
    }: {
      wishId: number;
      data: AttachImageFromUrl;
    }) => api.attachImageFromUrl(wishId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteWishImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wishId, imageId }: { wishId: number; imageId: number }) =>
      api.deleteWishImage(wishId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
