import { Link } from "react-router";
import { Button } from "../components/ui/button";

function Landing() {
  return (
    <>
      <p>This is the landing page</p>
      <Link to="/login">Login Page</Link>
      <Link to="/signup">Signup Page</Link>

      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button>Shad Button</Button>
    </>
  );
}

export default Landing;
