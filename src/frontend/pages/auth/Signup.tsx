import { Link } from "react-router";

function Signup() {
  return (
    <>
      <p>This is the signup page</p>
      <Link to="/">Home Page</Link>
      <Link to="/login">Login Page</Link>
    </>
  );
}

export default Signup;
