import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo } from "react";

import WishEditorForm from "../components/WishEditorForm";
import { useWishlist } from "../hooks/useWishlist";
import type { WishlistItem } from "../types/wishlist";

import { Alert, Button, Spinner } from "react-bootstrap";

export const Route = createFileRoute("/edit/$wishId")({
  component: () => <WishEditorRoute />,
});

function WishEditorRoute() {
  const { wishId } = Route.useParams() as { wishId: string };
  const router = useRouter();
  const { data: items, isLoading, isError, error } = useWishlist();

  const wishIdNumber = Number(wishId);
  const wish = useMemo<WishlistItem | undefined>(
    () => items?.find((w) => w.id === wishIdNumber),
    [items, wishIdNumber]
  );

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2 text-secondary">
        <Spinner size="sm" animation="border" /> Loading wish…
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="danger">
        Error loading wish: {(error as Error)?.message ?? "Unknown"}
      </Alert>
    );
  }

  if (!wish) {
    return (
      <Alert variant="warning">
        Wish not found.{" "}
        <Button
          variant="link"
          className="p-0"
          onClick={() => router.history.back()}
        >
          Back to list
        </Button>
      </Alert>
    );
  }

  return (
    <WishEditorForm
      key={wish.id}
      wish={wish}
      onCancel={() => router.history.back()}
    />
  );
}
