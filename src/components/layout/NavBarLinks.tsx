import { Link } from "@tanstack/react-router";

type NavBarLinksProps = {
    // Called when a link is chosen, e.g. to close the mobile menu
    onNavigate?: () => void;
};

const NavBarLinks = ({ onNavigate }: NavBarLinksProps) => {
    return (
        <>
            <Link to="/preview" className="nav-link" onClick={onNavigate}>
                Preview
            </Link>

            <Link to="/edit" className="nav-link" onClick={onNavigate}>
                Add & Edit
            </Link>

            <Link to="/giftlog" className="nav-link" onClick={onNavigate}>
                Gift log
            </Link>
        </>
    );
};

export default NavBarLinks;
