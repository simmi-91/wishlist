export type WishlistItem = {
  id: number;
  title: string;
  description: string;
  category: number;
  active: number;
  createdAt: string;
  updated: string;
};

export type NewWishlistItem = Pick<
  WishlistItem,
  "title" | "description" | "category"
>;
