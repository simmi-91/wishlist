import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "../auth/ProtectedRoute";

import { useToasts } from "../components/toastContext";
import type { WishlistItem } from "../types/wishlist";
import { useWishlist, useUpdateWishlistItem } from "../hooks/useWishlist";
import { formatDateOnly, formatDateAndTime } from "../utils/formatDate";

import Loading from "../features/Loading";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export const Route = createFileRoute("/preview")({
  component: () => (
    <ProtectedRoute>
      <PreviewRoute />
    </ProtectedRoute>
  ),
});

function PreviewRoute() {
  const { data: items, isLoading, isError, error } = useWishlist();
  const sortedItems =
    items?.slice().sort((a, b) => b.active - a.active || b.id - a.id) ?? [];

  const { addToast } = useToasts();
  const updateWish = useUpdateWishlistItem();

  const toggleState = async (item: WishlistItem) => {
    const newState = item.active === 1 ? 0 : 1;
    try {
      await updateWish.mutateAsync({
        id: item.id,
        data: { ...item, active: newState },
      });
      addToast({
        variant: "info",
        title: "State updated",
        message: `Toggled ${item.title} to ${newState === 1 ? "active" : "inactive"}`,
      });
    } catch (err) {
      const message = (err as Error)?.message ?? "Unknown error";
      addToast({
        variant: "danger",
        title: "Toggle failed",
        message,
      });
    }
  };

  function DisplayState(item: WishlistItem) {
    const color = item.active === 1 ? "success" : "secondary";
    const badgetext = item.active === 1 ? "Active" : "inactive";
    return (
      <Button
        variant={color}
        size="sm"
        className="mx-1"
        onClick={() => toggleState(item)}
      >
        {badgetext}
      </Button>
    );
  }

  function giftCard(item: WishlistItem) {
    const created = formatDateOnly(item.createdAt);
    const updated = formatDateAndTime(item.updated);

    return (
      <Col key={item.id} xs={12} md={6} lg={4}>
        <Card className="wish-card mb-1 shadow h-100">
          <Card.Header className="d-flex flex-row ">
            <div className=" flex-grow-1">Id: {item.id}</div>
            {DisplayState(item)}
            <div className="align-content-center px-1">
              <Link to={"/edit/$wishId"} params={{ wishId: String(item.id) }}>
                <i className="bi bi-pencil-square"></i>
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            <Card.Title>{item.title}</Card.Title>
            <Card.Text
              as="div"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </Card.Body>
          <Card.Footer className="text-muted">
            <small className="float-start">Created: {created}</small>
            <small className="float-end">Updated: {updated}</small>
          </Card.Footer>
        </Card>
      </Col>
    );
  }

  return (
    <Container>
      <Row className="text-center text-light p-2">
        <Col className="">
          <h1>Preview of wishes</h1>
        </Col>
      </Row>

      <Row>
        <Col>
          {isLoading && <Loading text={"Loading wishlist…"} color={"light"} />}
          {isError && (
            <div className="text-danger text-center">
              Error loading wishlist:{" "}
              {(error as Error)?.message ?? "Unknown error"}
            </div>
          )}
        </Col>
      </Row>

      {!isLoading && !isError && (
        <Row className="my-2 justify-content-center g-3">
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => giftCard(item))
          ) : (
            <p>No items yet.</p>
          )}
        </Row>
      )}
    </Container>
  );
}
