
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function ProtectedRoute({
  children,
  role,
  redirectTo = "/login"
}) {
  const [checking, setChecking] = useState(true);
  const [userAllowed, setUserAllowed] = useState(false);
  const [wrongRole, setWrongRole] = useState(false);
  const [blockedUser, setBlockedUser] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!storedUser) {
        if (isMounted) {
          setUserAllowed(false);
          setChecking(false);
        }
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/users/${storedUser.id}`
        );

        const currentUser = response.data;

        if (
          currentUser.blocked === true ||
          currentUser.status === "inactive"
        ) {
          localStorage.removeItem("user");

          toast.error(
            currentUser.blocked === true
              ? "Your account has been blocked by admin."
              : "Your account has been deactivated by admin."
          );

          if (isMounted) {
            setBlockedUser(true);
            setUserAllowed(false);
            setWrongRole(false);
            setChecking(false);
          }

          return;
        }

        if (role && currentUser.role !== role) {
          if (isMounted) {
            setWrongRole(true);
            setUserAllowed(false);
            setChecking(false);
          }
          return;
        }

        if (isMounted) {
          setBlockedUser(false);
          setWrongRole(false);
          setUserAllowed(true);
          setChecking(false);
        }
      } catch (error) {
        if (isMounted) {
          setUserAllowed(false);
          setChecking(false);
        }
      }
    };

    checkUser();

    const interval = setInterval(checkUser, 5000);

    const handleFocus = () => {
      checkUser();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [role]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#3B2A22]">
        Checking account...
      </div>
    );
  }

  if (!userAllowed) {
    if (blockedUser) {
      return <Navigate to="/login" replace />;
    }

    if (wrongRole) {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      return (
        <Navigate
          to={user?.role === "admin" ? "/admin" : "/home"}
          replace
        />
      );
    }

    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
