import { createRootRoute, Outlet } from "@tanstack/react-router";

import Header from "../components/layout/Header";

import { Container } from "react-bootstrap";

const RootLayout = () => (
  <>
    <main className="app-shell">
      <Header />

      <Container fluid className="content-scroll py-2">
        <Outlet />
      </Container>
    </main>
  </>
);

export const Route = createRootRoute({ component: RootLayout });
