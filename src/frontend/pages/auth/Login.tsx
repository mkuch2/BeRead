import { Link } from "react-router";
function Login() {
  return (
    <>
      <p>Login page</p>
      <Link to="/">Home Page</Link>
      <Link to="/signup">Signup Page</Link>
    </>
  );
}

export default Login;
