import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import DisplayProfile from "./pages/profile/DisplayProfile.tsx";
import BookSearch from "./components/BookSearch.tsx";
import AddPost from "./pages/AddPost";
import EditProfile from "./pages/profile/EditProfile.tsx";
import DisplayPost from "./pages/DisplayPost.tsx";

const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/signup", Component: Signup },
  { path: "/login", Component: Login },
  { path: "/addpost", Component: AddPost },
  { path: "/display-post", Component: DisplayPost },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/display-profile",
    element: (
      <ProtectedRoute>
        <DisplayProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit-profile",
    element: (
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    ),
  },

  { path: "/books", Component: BookSearch }, // book search page
]);

export default router;
