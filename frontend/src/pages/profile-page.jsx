// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import PostCard from "../components/PostCard";
import PostModal from "../components/PostModal";

const BACKEND_BASE_URL = "http://localhost:8080/";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ profileName: "", bio: "", profilePic: "" });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const [followInfo, setFollowInfo] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [followInfoLoading, setFollowInfoLoading] = useState(false);
  const [followInfoError, setFollowInfoError] = useState(null);
  const [followActionLoading, setFollowActionLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const getInitials = (name) => (!name ? "?" : name.charAt(0).toUpperCase());
  const currentUserId = profile?.userId ?? null;

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_BASE_URL}api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
        setFormData({
          profileName: data.profileName || "",
          bio: data.bio || "",
          profilePic: data.profilePic || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (!profile?.userId || !token) return;
    const fetchFollowInfo = async () => {
      setFollowInfoLoading(true);
      try {
        const res = await fetch(`${BACKEND_BASE_URL}api/users/${profile.userId}/follow-info`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setFollowInfo({
          followersCount: data.followersCount ?? 0,
          followingCount: data.followingCount ?? 0,
          isFollowing: data.isFollowing ?? false,
        });
      } catch (err) {
        console.error("Follow info error:", err);
        setFollowInfoError(err.message);
      } finally {
        setFollowInfoLoading(false);
      }
    };
    fetchFollowInfo();
  }, [profile?.userId, token]);

  useEffect(() => {
    if (!token) return;
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const res = await fetch(`${BACKEND_BASE_URL}api/posts/my-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setPostsError(err.message);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, [token]);

  const handleFollowToggle = async () => {
    if (!profile?.userId || !token) return;
    setFollowActionLoading(true);
    try {
      const action = followInfo.isFollowing ? "unfollow" : "follow";
      const res = await fetch(`${BACKEND_BASE_URL}api/users/${profile.userId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(await res.text());
      setFollowInfo((prev) => ({
        followersCount: prev.followersCount + (action === "follow" ? 1 : -1),
        followingCount: prev.followingCount,
        isFollowing: action === "follow",
      }));
    } catch (err) {
      console.error("Follow toggle error:", err);
      setFollowInfoError(err.message);
    } finally {
      setFollowActionLoading(false);
    }
  };

  const onChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImageFile(file);
    setFormData((prev) => ({ ...prev, profilePic: URL.createObjectURL(file) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("No auth token found. Please login again.");
    if (!formData.profileName.trim() && !formData.bio.trim() && !selectedImageFile)
      return alert("Please enter something to update.");

    setLoading(true);
    setSuccessMsg("");

    try {
      const form = new FormData();
      form.append("profileName", formData.profileName);
      form.append("bio", formData.bio);
      form.append("userId", profile.userId);
      if (selectedImageFile) form.append("profilePic", selectedImageFile);

      const res = await fetch(`${BACKEND_BASE_URL}api/profile/create-or-update`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error(await res.text());
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);
      setSelectedImageFile(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Profile update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        profileName: profile.profileName || "",
        bio: profile.bio || "",
        profilePic: profile.profilePic || "",
      });
    }
    setIsEditing(false);
    setSuccessMsg("");
  };

  const openPostModal = (post) => setSelectedPost(post);
  const closePostModal = () => setSelectedPost(null);

  const onDeletePost = (deletedId) => {
    setPosts((prev) => prev.filter((post) => post.id !== deletedId));
    closePostModal();
  };

  const onEditPost = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    closePostModal();
  };

  const isProfileEmpty =
    !formData.profileName.trim() && !formData.bio.trim() && !formData.profilePic.trim();

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row min-h-screen bg-black text-white pt-12">
        <Sidebar />
        <div className="md:ml-64 px-4 md:px-40 py-10 w-full max-w-7xl">
          <h1 className="text-3xl md:text-4xl font-light mb-6">Your Profile</h1>

          {successMsg && <div className="mb-4 p-3 bg-green-700 rounded">{successMsg}</div>}

          {isProfileEmpty && (
            <div className="mb-6 p-4 bg-yellow-700 rounded text-yellow-100 font-semibold text-center">
              Your profile looks empty. Please fill in your details below.
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:space-x-8 mb-8">
            <div className="relative flex flex-col items-center mb-6 md:mb-0">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <Avatar
                  src={formData.profilePic || profile?.profilePic}
                  alt="User profile"
                  initials={getInitials(profile?.username)}
                  size="lg"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-1 rounded-full text-white shadow-lg"
                    style={{ transform: "translate(25%, 25%)" }}
                    disabled={uploadingImage}
                    title="Upload profile picture"
                  >
                    {uploadingImage ? "..." : "+"}
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center mt-4 space-y-2">
                <div className="flex space-x-8 text-center text-white text-sm font-semibold select-none">
                  <div>
                    <span className="block text-lg font-bold">
                      {followInfoLoading ? "..." : followInfo.followersCount}
                    </span>
                    Followers
                  </div>
                  <div>
                    <span className="block text-lg font-bold">
                      {followInfoLoading ? "..." : followInfo.followingCount}
                    </span>
                    Following
                  </div>
                </div>
              </div>

              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            <div className="flex-1 space-y-4 relative">
              {!isEditing ? (
                <>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-300">Profile Name</label>
                    <p className="text-white text-lg">
                      {formData.profileName || "No profile name set"}
                    </p>
                  </div>
                  <div className="relative">
                    <label className="block mb-1 font-semibold text-gray-300">Bio</label>
                    <p className="whitespace-pre-wrap text-gray-300 min-h-[4rem]">
                      {formData.bio || "No bio set"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-1 rounded-full text-white text-xs font-bold shadow-md"
                      title="Edit Profile"
                    >
                      ✏️
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-semibold text-gray-300">Profile Name</label>
                    <input
                      name="profileName"
                      value={formData.profileName}
                      onChange={onChange}
                      className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-gray-300">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={onChange}
                      rows={3}
                      className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-light mt-8 mb-4">Posts</h2>
          {postsLoading && <div>Loading posts...</div>}
          {postsError && <div className="text-red-500">{postsError}</div>}
          {!postsLoading && posts.length === 0 && <div>No posts yet.</div>}
          <div className="flex flex-wrap -m-2">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={openPostModal}
                onEdit={onEditPost}
                onDelete={onDeletePost}
                isOwnProfile={true}
              />
            ))}
          </div>
          {selectedPost && (
            <PostModal
              post={selectedPost}
              onClose={closePostModal}
              onDelete={onDeletePost}
              onEdit={onEditPost}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
