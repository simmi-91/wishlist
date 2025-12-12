import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "../auth/ProtectedRoute";

import type { WishlistItem } from "../types/wishlist";
import { useWishlist } from "../hooks/useWishlist";
import { formatDateOnly, formatDateAndTime } from "../utils/formatDate";

import { Container, Row, Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";

export const Route = createFileRoute("/preview")({
  component: () => (
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  ),
});

function Index() {
  const { data: items, isLoading, isError, error } = useWishlist();

  function giftCard(item: WishlistItem) {
    const created = formatDateOnly(item.createdAt);
    const updated = formatDateAndTime(item.updated);
    return (
      <Col xs={12} md={6} lg={4}>
        <Card className="text-center mb-1">
          <Card.Header>
            <span className=" float-start">Id: {item.id}</span>
            <span className=" float-end"></span>
          </Card.Header>
          <Card.Body>
            <Card.Title>{item.title}</Card.Title>
            <Card.Text>{item.description}</Card.Text>
          </Card.Body>
          <Card.Footer className="text-muted">
            <small className=" float-start">created: {created}</small>
            <small className=" float-end">Updated: {updated}</small>
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
          {isLoading && <p className="text-info">Loading wishlist…</p>}
          {isError && (
            <p className="text-danger">
              Error loading wishlist:
              {(error as Error)?.message ?? "Unknown error"}
            </p>
          )}
        </Col>
      </Row>

      {!isLoading && !isError && (
        <Row className="my-2 justify-content-center">
          {items && items.length > 0 ? (
            items.map((item) => giftCard(item))
          ) : (
            <p>No items yet.</p>
          )}
        </Row>
      )}
    </Container>
  );
}
