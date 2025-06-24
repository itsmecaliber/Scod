import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SignIn = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showBannedDialog, setShowBannedDialog] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://scod.onrender.com/api/auth/login", formData);
      console.log("Logged in:", response.data);

      const token = response.data.token;
      localStorage.setItem("token", token);

      const user = jwtDecode(token);
      console.log("Decoded Token:", user);

      localStorage.setItem("username", user.sub);

      if (user.isAdmin === true) {
        navigate("/Admin");
      } else {
        navigate("/homepage");
      }

    } catch (err) {
      console.error("Login failed:", err);
      
      if (err.response) {
        if (err.response.status === 403) {
          // Account is banned
          setShowBannedDialog(true);
        } else {
          // Other errors (like 401 for wrong credentials)
          setError("Invalid username or password.");
        }
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black px-4">
      <Card className="w-full max-w-md bg-black text-white border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)] rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Sign In to Your Account
          </CardTitle>
          <p className="text-sm text-gray-400 text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          <div className="space-y-3">
            <Button
              className="w-full flex gap-2 bg-[#181818] text-white border border-white/30 hover:bg-[#222222]"
              onClick={handleOAuthLogin}
            >
              <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </Button>
          </div>
          <Separator className="my-6 bg-white/20" />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-300">Username</label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                className="bg-black border border-white/30 text-white focus:ring-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-black border border-white/30 text-white focus:ring-white"
              />
            </div>
            <Button type="submit" className="w-full mt-4 bg-white text-black hover:bg-gray-200">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Banned Account Dialog */}
      <AlertDialog open={showBannedDialog} onOpenChange={setShowBannedDialog}>
        <AlertDialogContent className="bg-black text-white border border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Account Suspended</AlertDialogTitle>
            <AlertDialogDescription>
              Your account has been suspended. Please contact support for assistance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setShowBannedDialog(false)}
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SignIn;
