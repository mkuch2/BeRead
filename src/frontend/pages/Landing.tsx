import { Link } from "react-router";

function Landing() {
  return (
    <>
      <p>This is the landing page</p>
      <Link to="/login">Login Page</Link>
      <Link to="/signup">Signup Page</Link>
    </>
  );
}

export default Landing;
