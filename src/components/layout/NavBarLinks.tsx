import { Link } from "@tanstack/react-router";

const NavBarLinks = () => {
  return (
    <>
      <Link to="/preview" className="nav-link">
        Preview
      </Link>

      <Link to="/edit" className="nav-link">
        Edit
      </Link>
    </>
  );
};
export default NavBarLinks;
