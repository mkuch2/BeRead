import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { FirebaseError } from "firebase/app";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";

function Landing() {
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
      <p>This is the landing page</p>
      <Link to="/login">Login Page</Link>
      <Link to="/signup">Signup Page</Link>

      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button onClick={handleSignOut}>Signout Button</Button>
    </>
  );
}

export default Landing;
