import AppLayout from "./layout/app-layout";
import LandingPage from "./pages/landing";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Onboarding from "./pages/onboarding";
import JobListing from "./pages/job-listing";
import JobPage from "./pages/job";
import SavedJobs from "./pages/saved-job";
import MyJobs from "./pages/myjobs";
import PostJob from "./pages/Posts";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import UserProfileView from "./components/UserProfileView";
import UserSearchBar from "./components/UserSearchBar";
import { ThemeProvider } from "./components/theme-provider";
import HomePage from "./pages/home-page";
import ProfilePage from "./pages/profile-page";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute"; // ✅ Admin-only route protection
import CreatePost from "@/components/CreatePost";
import JobType from "./pages/jobType";
import ChatPage from "./pages/ChatPage";
import Admin from "./pages/Admin";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/signin", element: <SignIn /> },

      // ✅ Admin-only route
      {
        element: <AdminRoute />,
        children: [{ path: "/Admin", element: <Admin /> }],
      },

      // ✅ Protected Routes for regular users
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/homepage", element: <HomePage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/onboarding", element: <Onboarding /> },
          { path: "/jobs", element: <JobListing /> },
          { path: "/job", element: <JobPage /> },
          { path: "/post-job", element: <PostJob /> },
          { path: "/saved-job", element: <SavedJobs /> },
          { path: "/my-jobs", element: <MyJobs /> },
          { path: "/jobtype", element: <JobType /> },
          { path: "/search", element: <UserSearchBar /> },
          { path: "/profile/:userId", element: <UserProfileView /> },
          { path: "/chat/:receiverId", element: <ChatPage /> },
          { path: "/chat", element: <ChatPage /> },
          { path: "/create-post", element: <CreatePost /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
