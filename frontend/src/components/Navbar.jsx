import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="fixed top-0 w-full border-b bg-black py-1 z-50">
      <nav className="py-1 flex justify-between items-center px-5">
        <div
          onClick={() => navigate("/homepage")}
          className="cursor-pointer"
        >
          <img src="/te-logo.png" className="h-9" alt="Logo" />
        </div>

        {/* Only show logout button */}
        <Button
          onClick={handleLogout}
          className="h-8 px-4 text-sm bg-red-600 hover:bg-red-700 text-white"
        >
          Logout
        </Button>
      </nav>
    </header>
  );
};

export default Navbar;
