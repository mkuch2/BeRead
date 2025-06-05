import { Link, useNavigate } from "react-router";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import { FirebaseError } from "firebase/app";
import axios from "axios";
import { useEffect, useState } from "react";

export default function NavBar() {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuthContext() as AuthContextType;
  const [friendReqs, setFriendReqs] = useState<boolean>(false);

  useEffect(() => {
    const getFriendRequests = async () => {
      const token = await currentUser?.getIdToken();

      if (!token) {
        console.log("Error getting user token");
      }

      try {
        const response = await axios.get("/api/friend-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("navbar getFriendReqs response", response);

        if (response.data.length > 0) {
          setFriendReqs(true);
        }
      } catch (e) {
        console.log("Error getting friend requests", e);
      }
    };

    getFriendRequests();
  });

  const handleSignOut = async () => {
    try {
      await signOut();

      navigate("/home");
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e.code, e.message);
      }
    }
  };

  return (
    <>
      <header className="border border-zinc-600 flex justify-between items-center px-4 py-2 mb-2">
        <div className="flex items-center space-x-4">
          <Link to={currentUser ? "/home" : "/"}>
            <h1 className="font-bold text-xl text-white">BeRead</h1>
          </Link>

          <Link
            to={"/home"}
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            Home
          </Link>

          {!currentUser ? (
            ""
          ) : (
            <>
              {friendReqs ? (
                <Link
                  to="/friends"
                  className="text-sm text-zinc-400 hover:text-white transition font-bold italic"
                >
                  Friends
                </Link>
              ) : (
                <Link
                  to="/friends"
                  className="text-sm text-zinc-400 hover:text-white transition"
                >
                  Friends
                </Link>
              )}

              <Link
                to="/display-profile"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Profile
              </Link>
            </>
          )}

          <Link
            to="/post-feed"
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            Posts
          </Link>
        </div>

        {!currentUser ? (
          <Link
            to="/login"
            className="text-sm font-light text-zinc-400 hover:text-white"
          >
            Login
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-light text-zinc-400 ml-2 hover:text-white"
          >
            Logout
          </button>
        )}
      </header>
    </>
  );
}
