import { Navigate } from "react-router";
import { useAuthContext, type AuthContextType } from "./hooks/useAuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuthContext() as AuthContextType;

  if (isLoading) {
    return <div></div>;
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
