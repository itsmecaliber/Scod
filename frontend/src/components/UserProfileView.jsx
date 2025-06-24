// src/pages/UserProfileView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import PostCard from "../components/PostCard";
import Sidebar from "../components/Sidebar";
import PostModal from "../components/PostModal";

const BACKEND_BASE_URL = "https://scod.onrender.com/";

const UserProfileView = () => {
  const { userId: username } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUsername = localStorage.getItem("username");

  const [profile, setProfile] = useState(null);
  const [targetUserId, setTargetUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followInfoLoading, setFollowInfoLoading] = useState(false);
  const [followInfoError, setFollowInfoError] = useState(null);
  const [followActionLoading, setFollowActionLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(storedUsername);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND_BASE_URL}api/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch current user profile");
        return res.json();
      })
      .then((data) => {
        setCurrentUserId(data.userId);
        setCurrentUsername(data.username || storedUsername);
      })
      .catch((err) => {
        console.error("❌ Error fetching current user ID:", err);
      });
  }, [token]);

  useEffect(() => {
    if (!token || !username) return;

    setLoading(true);
    setError(null);

    fetch(`${BACKEND_BASE_URL}api/profile/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setTargetUserId(data.userId);

        setFollowInfoLoading(true);
        fetch(`${BACKEND_BASE_URL}api/users/${data.userId}/follow-list`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch follow list");
            return res.json();
          })
          .then((listData) => {
            setFollowersList(listData.followers || []);
            setFollowingList(listData.following || []);
            setFollowInfoError(null);
          })
          .catch((err) => {
            setFollowInfoError(err.message || "Failed to fetch follow info");
          })
          .finally(() => setFollowInfoLoading(false));
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token, username]);

  useEffect(() => {
    if (!token || !username) return;

    setPostsLoading(true);
    setPostsError(null);

    fetch(`${BACKEND_BASE_URL}api/posts/user/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user posts");
        return res.json();
      })
      .then(async (data) => {
        const enrichedPosts = await Promise.all(
          data.map(async (post) => {
            try {
              const res = await fetch(`${BACKEND_BASE_URL}api/profile/${post.userId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const profileData = await res.json();
              return {
                ...post,
                profileName: profileData.profileName,
                profilePic: profileData.profilePic,
              };
            } catch (e) {
              return { ...post, profileName: "Unknown", profilePic: "" };
            }
          })
        );
        setPosts(enrichedPosts);
      })
      .catch((err) => {
        setPostsError(err.message);
      })
      .finally(() => setPostsLoading(false));
  }, [token, username]);

  const handleFollow = async () => {
    if (!token || !currentUserId || !targetUserId) return;

    setFollowActionLoading(true);
    setFollowInfoError(null);

    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}api/users/${currentUserId}/follow/${targetUserId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(await res.text());

      setFollowersList((prev) => [...prev, currentUsername]);
    } catch (err) {
      setFollowInfoError(err.message);
    } finally {
      setFollowActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!token || !currentUserId || !targetUserId) return;

    setFollowActionLoading(true);
    setFollowInfoError(null);

    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}api/users/${currentUserId}/unfollow/${targetUserId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(await res.text());

      setFollowersList((prev) => prev.filter((u) => u !== currentUsername));
    } catch (err) {
      setFollowInfoError(err.message);
    } finally {
      setFollowActionLoading(false);
    }
  };

  const isFollowing = followersList.includes(currentUsername);
  const openPostModal = (post) => setSelectedPost(post);
  const closePostModal = () => setSelectedPost(null);
  const getInitials = (name) => (!name ? "?" : name.charAt(0).toUpperCase());

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!profile) return <div>No profile found.</div>;

  const avatarSrc =
    profile.profilePic?.startsWith("http") || profile.profilePic?.startsWith("data:")
      ? profile.profilePic
      : `${BACKEND_BASE_URL.replace(/\/$/, "")}${profile.profilePic}`;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20 flex flex-col md:flex-row">
        <Sidebar />

        <div className="w-full md:ml-64 px-4 flex justify-center">
          <div className="max-w-4xl w-full">
            <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 mb-8 border-b border-gray-700 pb-6">
              <Avatar
                src={avatarSrc}
                alt={profile.profileName}
                initials={getInitials(profile.profileName)}
                size="lg"
              />

              <div className="flex-1 mt-4 md:mt-0 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h1 className="text-3xl font-semibold">{profile.profileName || "User Profile"}</h1>
                  {profile.username !== currentUsername && (
                    <div className="flex gap-2">
                      {!isFollowing ? (
                        <Button
                          disabled={followActionLoading || followInfoLoading}
                          onClick={handleFollow}
                          className="px-4 py-1 text-sm bg-green-600 hover:bg-green-700 rounded"
                        >
                          {followActionLoading ? "..." : "Follow"}
                        </Button>
                      ) : (
                        <Button
                          disabled={followActionLoading || followInfoLoading}
                          onClick={handleUnfollow}
                          className="px-4 py-1 text-sm bg-red-600 hover:bg-red-700 rounded"
                        >
                          {followActionLoading ? "..." : "Unfollow"}
                        </Button>
                      )}
                      <Button
                        onClick={() => navigate(`/chat/${targetUserId}`)}
                        className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        Message
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-gray-400 text-sm mt-1 break-all">{profile.username}</p>

                <div className="flex gap-6 text-sm text-gray-300 mt-3">
                  <div>
                    <span className="font-semibold text-white">
                      {followInfoLoading ? "..." : followersList.length}
                    </span>{" "}
                    Followers
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {followInfoLoading ? "..." : followingList.length}
                    </span>{" "}
                    Following
                  </div>
                </div>

                {followInfoError && (
                  <p className="text-xs text-red-500 mt-2">{followInfoError}</p>
                )}

                <div className="mt-4">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {profile.bio || "No bio set"}
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-light mb-4">Posts</h2>
            {postsLoading && <div>Loading posts...</div>}
            {postsError && <div className="text-red-500">{postsError}</div>}
            {!postsLoading && posts.length === 0 && <div>No posts yet.</div>}

            <div className="flex flex-wrap -m-2">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={openPostModal}
                  isOwnProfile={false}
                  profileName={post.profileName}
                  profilePic={post.profilePic}
                />
              ))}
            </div>

            {selectedPost && <PostModal post={selectedPost} onClose={closePostModal} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfileView;
