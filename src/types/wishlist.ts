import type {WishlistImageItem} from './wishlistImage.ts';

export type WishlistItem = {
  id: number;
  title: string;
  description: string;
  category: number;
  active: number;
  createdAt: string;
  updated: string;
  images: WishlistImageItem[] | [];
};

export type NewWishlistItem = Pick<
  WishlistItem,
  "title" | "description" | "category" | "active" | "images"
>;
