
export type WishlistImageItem = {
  id: number;
  path: string;
  display_order: number;
  image_type: string;
  url: string;
};

export type UploadImageFile = {
  file: File;
  filename?: string;
}

export type AttachImageFromGallery = {
  imagePath: string;
};

export type AttachImageFromUrl = {
  imagePath: string;
};

export type ImageUploadResponse = {
  id: number;
  filename: string;
  url: string;
  path: string;
};