import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import auth from "../firebase";
import { FirebaseError } from "firebase/app";

function Landing() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();

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
