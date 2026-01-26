import type { MouseEvent } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatchRoute,
  useNavigate,
} from "@tanstack/react-router";
import { ProtectedRoute } from "../auth/ProtectedRoute";

import { useToasts } from "../components/toastContext";
import { useWishlist, useDeleteWishlistItem } from "../hooks/useWishlist";
import type { WishlistItem } from "../types/wishlist";

import Loading from "../features/Loading";

import { Container, Row, Col, ListGroup, Badge, Button } from "react-bootstrap";

export const Route = createFileRoute("/edit")({
  component: () => (
    <ProtectedRoute>
      <EditRoute />
    </ProtectedRoute>
  ),
});

function EditRoute() {
  const { addToast } = useToasts();
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();

  const { data: items, isLoading, isError, error } = useWishlist();
  const sortedItems =
    items?.slice().sort((a, b) => b.active - a.active || b.id - a.id) ?? [];

  const deleteWish = useDeleteWishlistItem();

  const isAtNewRoute = matchRoute({ to: "/edit/new" });

  const handleDelete = async (item: WishlistItem) => {
    if (confirm("delete id" + item.id)) {
      try {
        await deleteWish.mutateAsync(item.id);
        addToast({
          variant: "info",
          title: "Wish deleted",
          message: `Deleted ${item.title}`,
        });
      } catch (err) {
        const message = (err as Error)?.message ?? "Unknown error";
        addToast({
          variant: "danger",
          title: "Delete failed",
          message,
        });
      }
    }
  };

  const renderListItem = (item: WishlistItem) => (
    <Link
      key={item.id}
      to="/edit/$wishId"
      params={{ wishId: String(item.id) }}
      className="list-group-item list-group-item-action justify-content-between align-items-center"
    >
      <Container fluid>
        <Row>
          <Col xs={1}>{item.id}.</Col>
          <Col>{item.title}</Col>
        </Row>
        <Row>
          <Col>
            {item.active === 1 ? (
              <Badge bg="success" className="float-start">Active</Badge>
            ) : (
              <Badge bg="secondary" className="float-start">inctive</Badge>
            )}
          </Col>
          <Col>
            <Button
              className="float-end"
              variant="dark"
              size="sm"
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                event.stopPropagation();
                void handleDelete(item);
              }}
            >
              Delete
            </Button>
          </Col>
        </Row>
      </Container>
    </Link>
  );

  return (
    <Container fluid>
      <Row className="text-center text-light p-2">
        <Col className="">
          <h1>Edit the wishlist</h1>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={4} className="order-2 order-md-1">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h5 className="mb-3">
              <i className="bi bi-pencil-square" /> Select a wish
            </h5>
            {isLoading && (
              <Loading
                scale={"sm"}
                display={"row"}
                text={"Loading wishes…"}
                color={"secondary"}
              />
            )}
            {isError && (
              <div className="text-danger">
                Error loading wishlist: {(error as Error)?.message ?? "Unknown"}
              </div>
            )}
            {!isLoading && !isError && (
              <>
                {isAtNewRoute ? (
                  <Button
                    className="btn-primary mb-2"
                    onClick={() => {
                      navigate({
                        to: "/edit/new",
                        search: { _reset: Date.now() },
                        replace: true,
                      });
                    }}
                  >
                    Add new wish
                  </Button>
                ) : (
                  <Link
                    to="/edit/new"
                    search={{}}
                    className="btn btn-primary mb-2"
                  >
                    Add new wish
                  </Link>
                )}

                {sortedItems.length > 0 ? (
                  <ListGroup>{sortedItems.map(renderListItem)}</ListGroup>
                ) : (
                  <p className="text-muted mb-0">No wishes yet.</p>
                )}
              </>
            )}
          </div>
        </Col>
        <Col md={8} className="order-1 order-md-2">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
