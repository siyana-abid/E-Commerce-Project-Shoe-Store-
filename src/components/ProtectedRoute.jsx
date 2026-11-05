import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role, redirectTo = "/login" }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // User login cheythittillenkil
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role check
  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin" : "/home"}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;