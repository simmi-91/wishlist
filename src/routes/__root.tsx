import { createRootRoute, Outlet, useBlocker } from "@tanstack/react-router";

import { usePendingChanges } from "../hooks/usePendingChanges";
import Header from "../components/layout/Header";

import { Container } from "react-bootstrap";

const RootLayout = () => {
  const { hasPendingChanges, setHasPendingChanges } = usePendingChanges();

  useBlocker({
    shouldBlockFn: ({ current, next }) => {
      if (
        current.routeId === "/edit/$wishId" &&
        current.pathname != next.pathname &&
        hasPendingChanges
      ) {
        const shouldLeave = confirm("Are you sure you want to leave?");
        if (shouldLeave) {
          setHasPendingChanges(false);
        }
        return !shouldLeave;
      } else {
        return false;
      }
    },
    enableBeforeUnload: hasPendingChanges,
  });

  return (
    <>
      <main className="app-shell">
        <Header />

        <Container fluid className="content-scroll py-2">
          <Outlet />
        </Container>
      </main>
    </>
  );
};

export const Route = createRootRoute({
  component: RootLayout,
});
