import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "" // 'success' or 'error'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register", 
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Registered:", response.data);
      showNotification(`Account created for ${formData.username}! Redirecting...`, 'success');
      
      setTimeout(() => {
        setIsRegistered(true);
      }, 3000);
      
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMessage = err.response?.data?.message || 
                         (err.response?.status === 409 ? 
                         "Username already taken" : 
                         "Registration failed. Please try again.");
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  if (isRegistered) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-black px-4 relative">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center space-x-2
          ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
          animate-fade-in`}>
          <span>{notification.message}</span>
          {notification.type === 'success' && (
            <div className="w-full bg-white/20 h-1 mt-2 absolute bottom-0 left-0 rounded-b-md">
              <div className="bg-white h-full animate-[countdown_3s_linear_forwards]" />
            </div>
          )}
        </div>
      )}
      
      <Card className="w-full max-w-md bg-black text-white border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)] rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Create an account
          </CardTitle>
          <p className="text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </CardHeader>
        <CardContent>
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
                required
                minLength={3}
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
                required
                minLength={3}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full mt-4 bg-white text-black hover:bg-gray-200"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;