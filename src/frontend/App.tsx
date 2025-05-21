import "./App.css";
import { RouterProvider } from "react-router";
import router from "./routes.tsx";
import { AuthProvider } from "./AuthContext";

function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
