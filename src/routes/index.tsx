import { createFileRoute } from "@tanstack/react-router";

import { Container, Row, Col } from "react-bootstrap";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <Container>
      <Row className=" p-2">
        <Col className=" text-light">Page for editing wishes</Col>
      </Row>
    </Container>
  );
}
