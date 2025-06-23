// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" />;
  }

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));

    // 🔒 If the user is an admin, redirect them to /Admin
    if (decoded.isAdmin) {
      return <Navigate to="/Admin" />;
    }

    // ✅ Allow regular users through
    return <Outlet />;
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/signin" />;
  }
};

export default ProtectedRoute;
