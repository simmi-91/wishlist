import NavBarLinks from "./NavBarLinks";
import AuthStatusDisplay from "../../auth/AuthStatusDisplay";

import { Link } from "@tanstack/react-router";
import { Container, Navbar, Nav } from "react-bootstrap";

const Header = () => {
  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand>
            <Link to="/" className="text-decoration-none text-reset">
              Wishlist & Gifts
            </Link>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls={"navbarScroll"} />

          <Navbar.Collapse id={"navbarScroll"}>
            <Nav className="me-auto my-2 my-lg-0" navbarScroll>
              <NavBarLinks />
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
