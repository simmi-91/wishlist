import client from "./client";
import type {
  UploadImageFile,
  ImageUploadResponse,
  AttachImageFromGallery,
  AttachImageFromUrl,
} from "../types/wishlistImage";

export async function uploadNewImage(
  wishId: number,
  data: UploadImageFile
): Promise<ImageUploadResponse> {

  const formData = new FormData();
  formData.append("image", data.file);
  if (data.filename) {
    formData.append("filename", data.filename);
  }

  return client.request<ImageUploadResponse>(`wishlist/${wishId}/images`, {
    method: "POST",
    body: formData,
  });
}

export async function attachImageFromGallery(
  wishId: number,
  data: AttachImageFromGallery
): Promise<{ message: string }> {
  return client.request<{ message: string }>(
    `wishlist/${wishId}/images/attach`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function attachImageFromUrl(
  wishId: number,
  data: AttachImageFromUrl
): Promise<{ message: string }> {
  return client.request<{ message: string }>(
    `wishlist/${wishId}/images/url`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteWishImage(
  wishId: number,
  imageId: number
): Promise<{ message: string }> {
  return client.request<{ message: string }>(
    `wishlist/${wishId}/images/${imageId}`,
    {
      method: "DELETE",
    }
  );
}