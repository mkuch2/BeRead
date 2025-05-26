import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "./pages/profile/Profile";

const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/signup", Component: Signup },
  { path: "/login", Component: Login },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
]);

export default router;
