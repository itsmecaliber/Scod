// AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
    const token = localStorage.getItem("token");

    if (!token) return <Navigate to="/signin" />;

    try {
        const decoded = JSON.parse(atob(token.split(".")[1]));

        // ✅ Only allow admins to access
        if (decoded.isAdmin) return <Outlet />;
        else return <Navigate to="/homepage" />;
    } catch (err) {
        return <Navigate to="/signin" />;
    }
};

export default AdminRoute;
