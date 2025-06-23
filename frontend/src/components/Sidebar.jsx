// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-black border-r border-gray-800 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black z-40">
      <ul className="space-y-6 text-lg font-medium mt-16">
        <li className="hover:text-gray-300 cursor-pointer">
          <Link to="/homepage">🏠 Home</Link>
        </li>
        <li className="hover:text-gray-300 cursor-pointer">
          <Link to="/jobtype">💼 Jobs</Link>
        </li>
        <li className="hover:text-gray-300 cursor-pointer">
          <Link to="/chat">📩 Messages</Link>
        </li>
        <li className="hover:text-gray-300 cursor-pointer">
          <Link to="/create-post">📝 Create Post</Link>
        </li>
        <li className="hover:text-gray-300 cursor-pointer">
          <Link to="/profile">👤 Profile</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
