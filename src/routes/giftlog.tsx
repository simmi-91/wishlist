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

// Shared frame for /giftlog (register), /giftlog/history and /giftlog/overview
function GiftlogLayout() {
    return (
        // px-0: the root layout's fluid container already pads the sides; this one only limits the width
        <Container data-bs-theme="dark" className="px-0">
            {/* Folder tabs: the active tab runs straight into the panel below. Never wrap to two lines:
                equal widths on mobile, icons only on very narrow screens (index.css) */}
            <Nav variant="tabs" className="giftlog-tabs">
                <Nav.Item>
                    {/* exact: otherwise this tab is active on /giftlog/history too */}
                    <Link to="/giftlog" className="nav-link" activeOptions={{ exact: true }} aria-label="Registrer">
                        <i className="bi bi-pencil-square me-1"></i>
                        <span className="tab-label">Registrer</span>
                    </Link>
                </Nav.Item>
                <Nav.Item>
                    <Link to="/giftlog/history" className="nav-link" aria-label="Historikk">
                        <i className="bi bi-search me-1"></i>
                        <span className="tab-label">Historikk</span>
                    </Link>
                </Nav.Item>
                <Nav.Item>
                    <Link to="/giftlog/overview" className="nav-link" aria-label="Oversikt">
                        <i className="bi bi-bar-chart me-1"></i>
                        <span className="tab-label">Oversikt</span>
                    </Link>
                </Nav.Item>
            </Nav>

            <div className="tab-panel">
                <Outlet />
            </div>
        </Container>
    );
}
