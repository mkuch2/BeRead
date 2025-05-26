import { useNavigate, Link } from "react-router";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import { FirebaseError } from "firebase/app";

function Home() {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuthContext() as AuthContextType;

  if (currentUser) {
    console.log(currentUser);
  } else {
    console.log("No user detected");
  }

  const handleSignOut = async () => {
    try {
      await signOut();

      //Redirect to Login
      navigate("/login");
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
          <h1 className="font-bold text-xl text-white">BeRead</h1>
          <Link to="/books" className="text-sm font-light text-zinc-400">Search Books</Link>
          <Link to="/profile" className="text-sm font-light text-zinc-400">Profile</Link>
        </div>
        <button type="button" onClick={handleSignOut} className="text-sm font-light text-zinc-400 ml-2">Logout</button>
      </header>
      <main>
        <div className="border border-zinc-600 ml-2 mr-2 mb-2">
          <p className="text-left m-1 font-light text-sm font-medium">Today's Prompt</p>
          <div className="flex justify-between items-center">
            <p className="text-left m-2 text-xs font-light text-zinc-300">Admin Generated Prompt</p>
            <Link to="/addpost" className="text-xs border border-zinc-600 rounded-xs text-white px-1 m-2">Post</Link>
          </div>
        </div>
        <p className="text-xs m-1 text-left italic text-zinc-200 font-thin">Most Recent</p>
        <p>TODO: List of Friend's Posts</p>
      </main>
    </>
  );
}
export default Home;
