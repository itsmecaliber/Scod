import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Feed from "@/components/Feed";
import Avatar from "../components/Avatar";
import FeedbackButton from "@/components/FeedbackWidget";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [topGamers, setTopGamers] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        const res = await axios.get("http://localhost:8080/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status < 500,
        });

        if (res.status === 200 && res.data) {
          setProfile(res.data);
        } else {
          if ([401, 403].includes(res.status)) {
            dispatch(logout());
            localStorage.removeItem("token");
            navigate("/");
          } else {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error("Unexpected error fetching profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchTopGamersWithProfiles = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:8080/api/users/top-followed", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200 && Array.isArray(res.data)) {
          const gamers = await Promise.all(
            res.data.map(async (user) => {
              try {
                const profileRes = await axios.get(`http://localhost:8080/api/profile/${user.userId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                return {
                  ...user,
                  profileName: profileRes.data?.profileName || "Unnamed",
                  profilePic: profileRes.data?.profilePic || null,
                };
              } catch (err) {
                console.warn(`Failed to fetch profile for user ${user.userId}`);
                return { ...user, profileName: "Unnamed", profilePic: null };
              }
            })
          );
          setTopGamers(gamers);
        }
      } catch (err) {
        console.error("Error fetching top gamers:", err);
      }
    };

    fetchProfile();
    fetchTopGamersWithProfiles();
  }, [dispatch, navigate]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      setSearchError(null);
      return;
    }
    fetchSearchResults(e.target.value);
  };

  const fetchSearchResults = async (query) => {
    setSearchLoading(true);
    setSearchError(null);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        `http://localhost:8080/api/profile/search?query=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status < 500,
        }
      );

      if (res.status === 200 && Array.isArray(res.data)) {
        setSearchResults(res.data);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to fetch search results");
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectUser = (userId) => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    navigate(`/profile/${userId}`);
  };

  const profileInitial = profile?.profileName?.charAt(0).toUpperCase() ?? "P";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white h-screen overflow-y-auto">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar profileInitial={profileInitial} />
      </div>

      {/* Main Content */}
      <div className="flex pt-16 flex-1 overflow-hidden ml-64">
        {/* Left Sidebar */}
        <aside className="hidden md:flex fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-black border-r border-gray-800 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black z-40">
          <ul className="space-y-6 text-lg font-medium">
            <li className="hover:text-gray-300 cursor-pointer">🏠 Home</li>
            <li className="hover:text-gray-300 cursor-pointer">
              <Link to="/jobtype">💼 Jobs</Link>
            </li>
            <li className="hover:text-gray-300 cursor-pointer">
              <Link to="/chat">📩 Messages</Link>
            </li>
            <li className="hover:text-gray-300 cursor-pointer">
              <Link to="/create-post">📝Create Post</Link>
            </li>
            <li className="hover:text-gray-300 cursor-pointer">
              <Link to="/profile">👤 Profile</Link>
            </li>
          </ul>
        </aside>

        {/* Feed Section */}
        <main className="flex-1 flex justify-center px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
          <div className="w-full max-w-[600px] flex flex-col h-full mx-auto">
            <div className="mb-4 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search gamers..."
                className="w-full px-4 py-2 rounded-full bg-zinc-900 text-white border border-gray-700 focus:outline-none focus:ring focus:border-blue-500"
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowDropdown(false), 150);
                }}
              />
              {showDropdown && (
                <ul className="absolute z-10 mt-1 bg-zinc-900 border border-gray-700 rounded-lg shadow-lg w-full max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
                  {searchLoading && (
                    <li className="p-2 text-gray-300">Loading...</li>
                  )}
                  {!searchLoading && searchResults.length === 0 && (
                    <li className="p-2 text-gray-400">No results found</li>
                  )}
                  {!searchLoading &&
                    searchResults.map((user) => (
                      <li
                        key={user.userId}
                        className="p-2 hover:bg-gray-800 cursor-pointer"
                        onMouseDown={() => handleSelectUser(user.userId)}
                      >
                        {user.profileName || "Unnamed"} (@{user.username})
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="flex-1">
              <Feed />
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 bg-black border-l border-gray-800 p-4 overflow-y-auto max-h-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
          {/* Current User Profile Section */}
          <div className="flex items-center justify-between mb-9">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <Avatar
                src={profile?.profilePic}
                initials={profile?.profileName?.charAt(0).toUpperCase() || "P"}
                size="sm"
              />
              <div>
                <div className="text-white font-semibold">{profile?.profileName || "My Profile"}</div>
                <div className="text-sm text-gray-400">Switch</div>
              </div>
            </div>
          </div>

          {/* Suggested Gamers */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Popular Gamers</h2>
            <ul className="space-y-3">
              {topGamers.length === 0 ? (
                <li className="text-gray-400">No suggestions available</li>
              ) : (
                topGamers.map((user) => {
                  const initial = user.profileName?.charAt(0).toUpperCase() ?? "U";
                  return (
                    <li
                      key={user.userId}
                      className="flex items-center gap-3 hover:text-green-400 cursor-pointer"
                      onClick={() => navigate(`/profile/${user.userId}`)}
                    >
                      <Avatar
                        src={user.profilePic}
                        initials={initial}
                        size="xs"
                      />
                      <span>{user.profileName}</span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Top Games */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Top Games</h2>
            <ul className="space-y-3">
              <li>🎮 BGMI</li>
              <li>🎮 Free Fire</li>
              <li>🎮 Valorant</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 text-white flex justify-around items-center py-2 md:hidden">
        <Link to="/homepage" className="flex flex-col items-center text-xs hover:text-blue-400">
          <span>🏠</span>
          <span>Home</span>
        </Link>
        <button
          onClick={() => document.querySelector("input[type='text']")?.focus()}
          className="flex flex-col items-center text-xs hover:text-blue-400"
        >
          <span>🔍</span>
          <span>Search</span>
        </button>
        <Link to="/create-post" className="flex flex-col items-center text-xs hover:text-blue-400">
          <span>➕</span>
          <span>Post</span>
        </Link>
        <Link to="/jobtype" className="flex flex-col items-center text-xs hover:text-blue-400">
          <span>💼</span>
          <span>Jobs</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-xs hover:text-blue-400">
          <span>👤</span>
          <span>Profile</span>
        </Link>
      </nav>
      <FeedbackButton />
    </div>
  );
};

export default HomePage;
