import NavBarLinks from "./NavBarLinks";
import AuthStatusDisplay from "../../auth/AuthStatusDisplay";

import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Container, Navbar, Nav } from "react-bootstrap";

const Header = () => {
    // Controlled, so the mobile menu closes when a link is chosen
    const [expanded, setExpanded] = useState(false);
    const closeMenu = () => setExpanded(false);

    // Publishes the header's height as --header-height, so sticky table headers (.sticky-head)
    // stop right below it. The height changes with screen size and when the mobile menu opens
    const headerRef = useRef<HTMLElement>(null);
    useLayoutEffect(() => {
        const header = headerRef.current;
        if (!header) {
            return;
        }
        const root = document.documentElement;
        const observer = new ResizeObserver(() => {
            root.style.setProperty("--header-height", `${header.offsetHeight}px`);
        });
        observer.observe(header);
        return () => {
            observer.disconnect();
            root.style.removeProperty("--header-height");
        };
    }, []);

    return (
        <header ref={headerRef} className="sticky-top border-bottom border-secondary">
            <Navbar
                bg="dark"
                variant="dark"
                expand="md"
                className="py-1 py-md-2"
                expanded={expanded}
                onToggle={setExpanded}>
                <Container fluid>
                    <Navbar.Brand className="header-brand">
                        <Link to="/" className="text-decoration-none text-reset" onClick={closeMenu}>
                            Wishlist & Gifts
                        </Link>
                    </Navbar.Brand>

                    {/* Only shown on mobile, so plain utilities make it smaller there */}
                    <Navbar.Toggle aria-controls={"navbarScroll"} className="py-1 px-2 fs-6" />

                    <Navbar.Collapse id={"navbarScroll"}>
                        {/* Links stay on one line in the collapsed menu too */}
                        <Nav
                            className="me-auto my-2 my-md-0 flex-row flex-wrap column-gap-3 column-gap-md-0"
                            navbarScroll>
                            <NavBarLinks onNavigate={closeMenu} />
                        </Nav>

                        <Nav className="px-1">
                            <AuthStatusDisplay />
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
};

export default Header;
