import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://scod.onrender.com/api/profile/search";

const UserSearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // get token
      console.log(token);
      const res = await axios.get(`${BACKEND_URL}?query=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`, // send token in headers
        },
      });

      setResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const visitProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded-xl shadow-md">
      <input
        type="text"
        className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
        placeholder="Search for a profile..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {loading && <p className="text-white mt-2">Searching...</p>}

      {results.length > 0 && (
        <ul className="mt-3 bg-gray-800 rounded-lg">
          {results.map((profile) => (
            <li
              key={profile.userId}
              onClick={() => visitProfile(profile.userId)}
              className="p-3 cursor-pointer hover:bg-gray-700 text-white border-b border-gray-700"
            >
              <strong>{profile.profileName}</strong>
              <p className="text-sm text-gray-300">{profile.bio}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearchBar;
