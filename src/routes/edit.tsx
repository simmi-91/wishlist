import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "../auth/ProtectedRoute";

import { Container, Row, Col } from "react-bootstrap";

export const Route = createFileRoute("/edit")({
  component: () => (
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  ),
});

function Index() {
  return (
    <Container>
      <Row className=" bg-see-through text-dark border border-1 rounded-5 p-2">
        <Col>Edit</Col>
      </Row>
    </Container>
  );
}
