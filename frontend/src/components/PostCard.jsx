// src/components/PostCard.jsx
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, X, Pencil, Trash, AlertCircle } from "lucide-react";
import axios from "axios";

const BACKEND_BASE_URL = "http://localhost:8080";

const PostCard = ({ post, onClick, onEdit, onDelete, isOwnProfile = false }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editDescription, setEditDescription] = useState(post.content || "");
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportType, setReportType] = useState(null); // 'user' or 'post'

  const token = localStorage.getItem("token");
  const videoRef = useRef(null);

  useEffect(() => {
    fetchLikeStatus();
    fetchLikeCount();
    fetchComments();
    fetchCurrentUserProfile();
  }, []);

  const fetchLikeStatus = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/interact/liked/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLiked(res.data);
    } catch (err) {
      console.error("Error fetching like status:", err);
    }
  };

  const fetchLikeCount = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/interact/likes/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikeCount(res.data);
    } catch (err) {
      console.error("Error fetching like count:", err);
    }
  };

  const toggleLike = async () => {
    try {
      await axios.post(`${BACKEND_BASE_URL}/api/interact/like/${post.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLikeStatus();
      fetchLikeCount();
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/interact/comment/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const commentWithProfiles = await Promise.all(
        res.data.map(async (c) => {
          if (!c.userId) {
            return {
              ...c,
              profileName: "Unknown",
              profilePicture: null,
            };
          }

          try {
            const profileRes = await axios.get(`${BACKEND_BASE_URL}/api/profile/${c.userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            return {
              ...c,
              profileName: profileRes.data?.profileName || c.username || "Unknown",
              profilePicture: profileRes.data?.profilePic || null,
              userId: c.userId // Ensure userId is included
            };
          } catch {
            return {
              ...c,
              profileName: c.username || "Unknown",
              profilePicture: null,
              userId: c.userId // Ensure userId is included
            };
          }
        })
      );

      setComments(commentWithProfiles);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchCurrentUserProfile = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentProfile(res.data);
    } catch (err) {
      console.error("Error fetching current user profile:", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post(
        `${BACKEND_BASE_URL}/api/interact/comment/${post.id}`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText("");
      fetchComments();
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setEditTitle(post.title);
    setEditDescription(post.content || "");
    setEditing(true);
  };

  const submitEdit = async () => {
    try {
      const res = await axios.put(
        `${BACKEND_BASE_URL}/api/posts/${post.id}`,
        { title: editTitle, content: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(false);
      if (onEdit) onEdit(res.data);
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      await axios.delete(`${BACKEND_BASE_URL}/api/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onDelete) onDelete(post.id);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const isOwner = isOwnProfile || (currentProfile && currentProfile.userId === post.userId);

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting");
      return;
    }

    try {
      const reportData = {
        reporterId: currentProfile?.userId,
        reason: reportReason,
      };

      if (reportType === 'post') {
        reportData.reportedPostId = post.id;
      } else if (reportType === 'user') {
        reportData.reportedUserId = post.userId;
      }

      await axios.post(
        `${BACKEND_BASE_URL}/api/report`,
        reportData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowReportModal(false);
      setReportType(null);
      setReportReason("");
      alert("Report submitted successfully.");
    } catch (err) {
      console.error("Error reporting:", err);
      alert("Failed to submit report.");
    }
  };

  const handleCardClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      e.preventDefault();
      if (videoRef.current) {
        videoRef.current.pause();
      }
      onClick(post);
    }
  };

  const resetReportModal = () => {
    setShowReportModal(false);
    setReportType(null);
    setReportReason("");
  };

  const navigateToProfile = (userId, e) => {
    e.stopPropagation();
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <>
      {/* Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-zinc-900 text-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentsModal(false);
              }}
            >
              <X size={22} />
            </button>
            <div className="p-4 space-y-2">
              <h2 className="text-lg font-semibold border-b border-gray-700 pb-2">All Comments</h2>
              {comments.length === 0 ? (
                <p className="text-gray-400">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="text-sm border-b border-gray-700 py-1 flex items-start gap-2">
                    <button 
                      onClick={(e) => navigateToProfile(c.userId, e)}
                      className="flex-shrink-0"
                    >
                      <Avatar className="w-6 h-6 mt-[2px]">
                        {c.profilePicture ? (
                          <AvatarImage
                            src={`${BACKEND_BASE_URL}/${c.profilePicture.startsWith("/") ? c.profilePicture.slice(1) : c.profilePicture}`}
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
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-zinc-900 text-white rounded-xl w-full max-w-md p-6 shadow-lg relative space-y-4">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              onClick={() => setEditing(false)}
            >
              <X size={22} />
            </button>
            <h2 className="text-xl font-bold mb-2">Edit Post</h2>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
              placeholder="Caption"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
              rows="4"
              placeholder="Description"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-1 rounded bg-gray-600 hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-zinc-900 text-white rounded-xl w-full max-w-md p-6 shadow-lg relative space-y-4">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              onClick={resetReportModal}
            >
              <X size={22} />
            </button>

            {!reportType ? (
              <>
                <h2 className="text-xl font-bold mb-4">What do you want to report?</h2>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setReportType('post')}
                    className="px-4 py-3 rounded bg-gray-700 hover:bg-gray-600 text-left"
                  >
                    <div className="font-semibold">Report Post</div>
                    <div className="text-sm text-gray-400">This post violates community guidelines</div>
                  </button>
                  <button
                    onClick={() => setReportType('user')}
                    className="px-4 py-3 rounded bg-gray-700 hover:bg-gray-600 text-left"
                  >
                    <div className="font-semibold">Report User</div>
                    <div className="text-sm text-gray-400">This user is violating community guidelines</div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2">
                  Report {reportType === 'post' ? 'Post' : 'User'}
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Why are you reporting this {reportType}?
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                  rows="4"
                  placeholder={`Please explain why you're reporting this ${reportType}...`}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReportType(null)}
                    className="px-4 py-1 rounded bg-gray-600 hover:bg-gray-700 text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleReport}
                    className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Post Card */}
      <div className="w-full sm:w-1/2 md:w-1/3 p-2">
        <Card className="bg-black text-white border border-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                {(() => {
                  const normalizePath = (path) => path?.startsWith("/") ? path.slice(1) : path;
                  let profilePicUrl = "";

                  if (isOwner && currentProfile?.profilePic) {
                    profilePicUrl = `${BACKEND_BASE_URL}/${normalizePath(currentProfile.profilePic)}`;
                  } else if (post?.profilePic) {
                    profilePicUrl = `${BACKEND_BASE_URL}/${normalizePath(post.profilePic)}`;
                  }

                  return (
                    <AvatarImage
                      src={profilePicUrl || undefined}
                      alt={post.profileName || post.username}
                    />
                  );
                })()}
                <AvatarFallback>
                  {(post.profileName || post.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="text-sm font-semibold text-white">
                {post.profileName || post.username}
              </span>
            </div>
            <div className="flex gap-2">
              {isOwner ? (
                <>
                  <button onClick={handleEdit} className="text-gray-400 hover:text-yellow-400">
                    <Pencil size={18} />
                  </button>
                  <button onClick={handleDelete} className="text-gray-400 hover:text-red-500">
                    <Trash size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-gray-400 hover:text-orange-500"
                >
                  <AlertCircle size={18} />
                </button>
              )}
            </div>
          </div>

          <div
            className={onClick ? "cursor-pointer" : ""}
            onClick={handleCardClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onClick && e.key === "Enter") {
                e.stopPropagation();
                handleCardClick(e);
              }
            }}
          >
            {post.mediaPath ? (
              post.mediaType?.startsWith("video") ? (
                <video
                  ref={videoRef}
                  src={`${BACKEND_BASE_URL}/${post.mediaPath}`}
                  controls={!onClick}
                  className="w-full h-80 object-cover pointer-events-none"
                />
              ) : (
                <img
                  src={`${BACKEND_BASE_URL}/${post.mediaPath}`}
                  alt={post.title}
                  className="w-full h-80 object-cover"
                />
              )
            ) : (
              <div className="w-full h-80 bg-gray-800 flex items-center justify-center text-gray-400">
                No media
              </div>
            )}
          </div>

          <div className="flex items-center px-4 pt-3 gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike();
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <Heart fill={liked ? "red" : "none"} color={liked ? "red" : "gray"} size={22} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentsModal(true);
              }}
              className="text-gray-400 hover:text-blue-400"
            >
              <MessageCircle size={22} />
            </button>
          </div>

          <div className="px-4 pt-1 text-sm font-medium text-white">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </div>

          <CardContent className="p-4 pb-1 pt-2">
            <p className="text-sm">
              <strong>{post.profileName || post.username}</strong> {post.title || ""}
            </p>
          </CardContent>

          <div className="px-4 text-sm text-gray-400">
            {comments.length > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCommentsModal(true);
                }}
                className="text-xs text-gray-500 hover:underline mb-1"
              >
                View all {comments.length} comments
              </button>
            )}

            {comments.slice(0, 2).map((c) => (
              <div key={c.id} className="flex items-start gap-2 mb-1">
                <button 
                  onClick={(e) => navigateToProfile(c.userId, e)}
                  className="flex-shrink-0"
                >
                  <Avatar className="w-6 h-6 mt-[2px]">
                    {c.profilePicture ? (
                      <AvatarImage
                        src={`${BACKEND_BASE_URL}/${c.profilePicture.startsWith("/") ? c.profilePicture.slice(1) : c.profilePicture}`}
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

          <div className="px-4 pb-4 pt-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  handleCommentSubmit();
                }
              }}
              className="w-full p-1 rounded bg-gray-800 text-white text-sm border border-gray-600"
            />
          </div>
        </Card>
      </div>
    </>
  );
};
export default PostCard;