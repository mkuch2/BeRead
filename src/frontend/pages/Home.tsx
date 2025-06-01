import { useNavigate, Link } from "react-router";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import { FirebaseError } from "firebase/app";
import PostSearch from "../components/PostSearch";
import NavBar from "../components/NavBar";

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
      <NavBar />
      <main>
        <div className="border border-zinc-600 ml-2 mr-2 mb-2">
          <p className="text-left m-1 font-light text-sm font-medium">
            Today's Prompt
          </p>
          <div className="flex justify-between items-center">
            <p className="text-left m-2 text-xs font-light text-zinc-300">
              Admin Generated Prompt
            </p>
            <Link
              to="/add-post"
              className="text-xs border border-zinc-600 rounded-xs text-white px-1 m-2"
            >
              Post
            </Link>
          </div>
        </div>
        <p className="text-xs m-1 text-left italic text-zinc-200 font-thin">
          Most Recent
        </p>
        <p>TODO: List of Friend's Posts</p>
        <PostSearch />
      </main>
    </>
  );
}
export default Home;
