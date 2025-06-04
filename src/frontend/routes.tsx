import { createBrowserRouter } from "react-router";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import DisplayProfile from "./pages/profile/DisplayProfile.tsx";
import AddPost from "./pages/posts/AddPost.tsx";
import EditProfile from "./pages/profile/EditProfile.tsx";
import DisplayPost from "./pages/posts/DisplayPost.tsx";
import FriendsList from "./components/FriendsList.tsx";
import OtherUserProfile from "./pages/profile/OtherUserProfile.tsx";
import PostFeed from "./pages/posts/PostFeed.tsx";

const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/signup", Component: Signup },
  { path: "/login", Component: Login },
  {
    path: "/add-post",
    element: (
      <ProtectedRoute>
        <AddPost />
      </ProtectedRoute>
    ),
  },
  { path: "/display-post", Component: DisplayPost },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/display-profile/:username",
    Component: OtherUserProfile,
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
  {
    path: "/friends",
    element: (
      <ProtectedRoute>
        <FriendsList />
      </ProtectedRoute>
    ),
  },
  { path: "/post-feed", Component: PostFeed },
]);

export default router;
