import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import BookSearch from "./components/BookSearch.tsx";
import AddPost from "./pages/AddPost";

const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/signup", Component: Signup },
  { path: "/login", Component: Login },
  { path: "/addpost", Component: AddPost },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  { path: "/books", Component: BookSearch }, // book search page
]);

export default router;
