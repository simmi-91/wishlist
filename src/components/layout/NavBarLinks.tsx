import { Link } from "@tanstack/react-router";

const NavBarLinks = () => {
    return (
        <>
            <Link to="/preview" className="nav-link">
                Preview
            </Link>

            <Link to="/edit" className="nav-link">
                Add & Edit
            </Link>

            <Link to="/giftlog" className="nav-link">
                Gift log
            </Link>
        </>
    );
};

export default NavBarLinks;
