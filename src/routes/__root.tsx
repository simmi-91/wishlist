import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

const RootLayout = () => (
  <>
    <header>
      <Link to="/" className="">
        Home
      </Link>
      <Link to="/preview" className="">
        preview
      </Link>
    </header>
    <main className="">
      <Outlet />
    </main>
  </>
);

export const Route = createRootRoute({ component: RootLayout });
