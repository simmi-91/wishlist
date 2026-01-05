import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";

import WishEditorForm from "../components/WishEditorForm";
import type { NewWishlistItem } from "../types/wishlist";

export const Route = createFileRoute("/edit/new")({
  component: NewWishRoute,
  validateSearch: (
    search: Record<string, unknown>
  ): { _reset?: string | number } => {
    return {
      _reset: search._reset ? (search._reset as string | number) : undefined,
    };
  },
});

function NewWishRoute() {
  const router = useRouter();
  const search = useSearch({ from: "/edit/new" });

  const emptyWish: NewWishlistItem = {
    title: "",
    description: "",
    category: 0,
    active: 1,
  };

  return (
    <WishEditorForm
      key={search._reset ?? "new"}
      wish={emptyWish}
      onCancel={() => router.history.back()}
    />
  );
}
