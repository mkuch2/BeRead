import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";

//TODO: FIGURE OUT HOW TO DISPLAY THESE ON APP.tsx

const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/signup", Component: Signup },
  { path: "/login", Component: Login },
]);

export default router;
