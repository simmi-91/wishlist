import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  basepath: "/wishlist",
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
