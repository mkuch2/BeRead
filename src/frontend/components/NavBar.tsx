import { Link, useNavigate } from "react-router";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import { FirebaseError } from "firebase/app";

export default function NavBar() {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuthContext() as AuthContextType;

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
          <Link to="/home">
            <h1 className="font-bold text-xl text-white">BeRead</h1>
          </Link>

          {!currentUser ? (
            ""
          ) : (
            <>
              <Link
                to="/friends"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Friends
              </Link>
              <Link
                to="/display-profile"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Profile
              </Link>
            </>
          )}
        </div>

        {!currentUser ? (
          <Link to="/login" className="text-sm font-light text-zinc-400">
            Login
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-light text-zinc-400 ml-2"
          >
            Logout
          </button>
        )}
      </header>
    </>
  );
}
