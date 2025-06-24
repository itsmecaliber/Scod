import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, X } from "lucide-react";

const BACKEND_BASE_URL = "https://scod.onrender.com";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeStates, setLikeStates] = useState({});
  const [commentData, setCommentData] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commenterProfiles, setCommenterProfiles] = useState({});
  const [profilePics, setProfilePics] = useState({});
  const [activeCommentModal, setActiveCommentModal] = useState(null);
  const [commenterProfilePics, setCommenterProfilePics] = useState({});

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/posts/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
        setLoading(false);

        for (const post of res.data) {
          fetchLikeStatus(post.id);
          fetchLikeCount(post.id);
          fetchComments(post.id);
        }

        fetchProfilePicsForPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const fetchProfilePicsForPosts = async (posts) => {
    const uniqueUserIds = [...new Set(posts.map((post) => post.userId))];
    const newPics = {};

    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          const res = await axios.get(`${BACKEND_BASE_URL}/api/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          newPics[userId] = res.data?.profilePic || null;
          commenterProfiles[userId] = res.data?.profileName || null;
        } catch (err) {
          console.error(`❌ Error fetching profile for user ${userId}`, err);
          newPics[userId] = null;
        }
      })
    );

    setProfilePics(newPics);
  };

  const fetchLikeStatus = async (postId) => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/interact/liked/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikeStates((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], liked: res.data },
      }));
    } catch (err) {
      console.error("Error fetching like status:", err);
    }
  };

  const fetchLikeCount = async (postId) => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/interact/likes/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikeStates((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], count: res.data },
      }));
    } catch (err) {
      console.error("Error fetching like count:", err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await axios.post(`${BACKEND_BASE_URL}/api/interact/like/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLikeStatus(postId);
      fetchLikeCount(postId);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const fetchCommenterProfile = async (userId) => {
    if (commenterProfiles[userId] && commenterProfilePics[userId]) return;
    
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCommenterProfiles((prev) => ({
        ...prev,
        [userId]: res.data.profileName,
      }));
      
      setCommenterProfilePics((prev) => ({
        ...prev,
        [userId]: res.data.profilePic || null,
      }));
    } catch (err) {
      console.error("Error fetching commenter profile:", err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/interact/comment/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Process comments with profile data
      const commentsWithProfiles = await Promise.all(
        res.data.map(async (comment) => {
          if (!comment.userId) {
            return {
              ...comment,
              profileName: "Unknown",
              profilePic: null,
            };
          }

          try {
            const profileRes = await axios.get(`${BACKEND_BASE_URL}/api/profile/${comment.userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            return {
              ...comment,
              profileName: profileRes.data?.profileName || comment.username || "Unknown",
              profilePic: profileRes.data?.profilePic || null,
            };
          } catch {
            return {
              ...comment,
              profileName: comment.username || "Unknown",
              profilePic: null,
            };
          }
        })
      );

      setCommentData((prev) => ({ ...prev, [postId]: commentsWithProfiles }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;
    try {
      await axios.post(
        `${BACKEND_BASE_URL}/api/interact/comment/${postId}`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  const closeModal = () => setActiveCommentModal(null);

  const navigateToProfile = (userId, e) => {
    e?.stopPropagation();
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 bg-muted/20">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-4 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className="text-muted-foreground">No posts yet.</p>;
  }

  return (
    <div className="space-y-6 relative">
      {posts.map((post) => {
        const normalizePath = (path) => (path?.startsWith("/") ? path.slice(1) : path);
        const profilePicUrl = profilePics[post.userId]
          ? `${BACKEND_BASE_URL}/${normalizePath(profilePics[post.userId])}`
          : "";

        return (
          <Card key={post.id} className="bg-black p-4 border border-gray-800">
            <div className="flex items-center space-x-3 mb-2">
              <Avatar>
                <AvatarImage src={profilePicUrl || undefined} alt={post.profileName || post.username} />
                <AvatarFallback>
                  {(post.profileName || post.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div
                onClick={() => navigate(`/profile/${post.userId}`)}
                className="text-sm font-semibold text-white cursor-pointer hover:underline"
              >
                @{post.profileName ?? "Unknown"}
              </div>
            </div>

            <CardContent className="p-0">
              <h3 className="text-base font-medium text-white">{post.title}</h3>
              <p className="text-sm text-gray-300">{post.content}</p>

              {post.mediaPath && post.mediaType?.startsWith("video") && (
                <div className="mt-3 flex justify-center">
                  <video
                    className="rounded-lg max-h-[500px] w-full object-contain"
                    controls
                    src={`${BACKEND_BASE_URL}/${post.mediaPath}`}
                    type={post.mediaType}
                  />
                </div>
              )}

              {post.mediaPath && post.mediaType?.startsWith("image") && (
                <div className="mt-3 flex justify-center">
                  <img
                    className="rounded-lg max-h-[600px] w-auto max-w-full object-contain"
                    src={`${BACKEND_BASE_URL}/${post.mediaPath}`}
                    alt="Post media"
                  />
                </div>
              )}
            </CardContent>

            <div className="flex items-center gap-4 pt-3">
              <button
                onClick={() => toggleLike(post.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Heart
                  fill={likeStates[post.id]?.liked ? "red" : "none"}
                  color={likeStates[post.id]?.liked ? "red" : "gray"}
                  size={20}
                />
              </button>
              <button
                onClick={() => setActiveCommentModal(post.id)}
                className="text-gray-400 hover:text-blue-400"
              >
                <MessageCircle size={20} />
              </button>
            </div>

            <div className="text-sm text-white mt-1">
              {likeStates[post.id]?.count ?? 0}{" "}
              {likeStates[post.id]?.count === 1 ? "like" : "likes"}
            </div>

            <div className="text-sm text-gray-400 space-y-1 mt-2">
              {(commentData[post.id]?.slice(0, 2) || []).map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <button 
                    onClick={(e) => navigateToProfile(c.userId, e)}
                    className="flex-shrink-0"
                  >
                    <Avatar className="w-6 h-6 mt-[2px]">
                      {c.profilePic ? (
                        <AvatarImage
                          src={`${BACKEND_BASE_URL}/${normalizePath(c.profilePic)}`}
                          alt={c.profileName}
                        />
                      ) : (
                        <AvatarFallback>{c.profileName?.charAt(0) || "U"}</AvatarFallback>
                      )}
                    </Avatar>
                  </button>
                  <div className="text-white text-sm leading-snug">
                    <button 
                      onClick={(e) => navigateToProfile(c.userId, e)}
                      className="font-semibold hover:underline mr-1"
                    >
                      {c.profileName}
                    </button> 
                    {c.content}
                  </div>
                </div>
              ))}
              {commentData[post.id]?.length > 2 && (
                <button
                  onClick={() => setActiveCommentModal(post.id)}
                  className="text-xs text-gray-500 underline"
                >
                  View all {commentData[post.id]?.length} comments
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInputs[post.id] || ""}
              onChange={(e) =>
                setCommentInputs((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCommentSubmit(post.id);
              }}
              className="w-full mt-2 p-1 rounded bg-gray-800 text-white text-sm border border-gray-600"
            />
          </Card>
        );
      })}

      {activeCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
          <div className="bg-zinc-900 text-white p-6 rounded-lg w-[90%] max-w-lg max-h-[80vh] overflow-y-auto scrollbar-hide relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-300 hover:text-white"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold mb-4">All Comments</h2>
            {(commentData[activeCommentModal] || []).map((c) => (
              <div key={c.id} className="mb-2 flex items-start gap-2">
                <button 
                  onClick={(e) => navigateToProfile(c.userId, e)}
                  className="flex-shrink-0"
                >
                  <Avatar className="w-6 h-6 mt-[2px]">
                    {c.profilePic ? (
                      <AvatarImage
                        src={`${BACKEND_BASE_URL}/${normalizePath(c.profilePic)}`}
                        alt={c.profileName}
                      />
                    ) : (
                      <AvatarFallback>{c.profileName?.charAt(0) || "U"}</AvatarFallback>
                    )}
                  </Avatar>
                </button>
                <div className="text-white text-sm leading-snug">
                  <button 
                    onClick={(e) => navigateToProfile(c.userId, e)}
                    className="font-semibold hover:underline mr-1"
                  >
                    {c.profileName}
                  </button> 
                  {c.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
