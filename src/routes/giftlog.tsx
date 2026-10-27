import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "../auth/ProtectedRoute";

import { Container, Nav } from "react-bootstrap";

export const Route = createFileRoute("/giftlog")({
    component: () => (
        <ProtectedRoute>
            <GiftlogLayout />
        </ProtectedRoute>
    ),
});

// Shared frame for /giftlog (register) and /giftlog/history
function GiftlogLayout() {
    return (
        // px-0: the root layout's fluid container already pads the sides; this one only limits the width
        <Container data-bs-theme="dark" className="px-0">
            <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                    {/* exact: otherwise this tab is active on /giftlog/history too */}
                    <Link to="/giftlog" className="nav-link" activeOptions={{ exact: true }}>
                        <i className="bi bi-pencil-square me-1"></i>
                        Registrer
                    </Link>
                </Nav.Item>
                <Nav.Item>
                    <Link to="/giftlog/history" className="nav-link">
                        <i className="bi bi-search me-1"></i>
                        Historikk
                    </Link>
                </Nav.Item>
            </Nav>

            <Outlet />
        </Container>
    );
}
