import { type ReactNode } from "react";
import { useAuth } from "./authContext";

import Loading from "../features/Loading";

import { Container, Row, Col } from "react-bootstrap";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authSession, isLoading } = useAuth();

  if (isLoading)
    return (
      <Container className=" d-flex justify-content-center text-center">
        <Loading text={"Loading Page…"} color={"primary"} />
      </Container>
    );
  if (!authSession)
    return (
      <Container>
        <Row className=" text-warning p-2">
          <Col>You are not allowed on this route...</Col>
        </Row>
      </Container>
    );
  return children;
}
