import React, { useEffect, useState } from "react";
import PostModal from "./PostModal"; // Ensure PostModal component exists

export default function ReportedPosts() {
    const [reportedPosts, setReportedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);

    // 🔁 Fetch reported posts from admin API
    const fetchReportedPosts = async () => {
        try {
            const res = await fetch("https://scod.onrender.com/api/admin/reports/posts", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setReportedPosts(data);
        } catch (err) {
            console.error("Failed to fetch reported posts:", err);
        } finally {
            setLoading(false);
        }
    };

    // ❌ Remove post by postId
    const handleRemovePost = async (postId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:8080/api/admin/reports/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (res.ok) {
                fetchReportedPosts(); // Refresh the list
                setSelectedPost(null); // Close modal
            } else {
                alert("Failed to remove post");
            }
        } catch (err) {
            console.error("Post removal failed:", err);
        }
    };

    // 👁 View post in modal
    const handleViewPost = async (postId) => {
        try {
            const res = await fetch(`http://localhost:8080/api/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Post not found");
            const data = await res.json();
            setSelectedPost(data);
        } catch (err) {
            console.error("Failed to fetch post:", err);
            alert("Could not load post.");
        }
    };

    useEffect(() => {
        fetchReportedPosts();
    }, []);

    return (
        <div className="bg-black text-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-1">🚨 Reported Posts</h2>
            <p className="text-gray-400 mb-4">Review and moderate flagged posts</p>

            {loading ? (
                <p className="text-gray-500">Loading reported posts...</p>
            ) : reportedPosts.length === 0 ? (
                <p className="text-gray-600 italic">No reported posts found.</p>
            ) : (
                <div className="space-y-4">
                    {reportedPosts.map((post) => (
                        <div
                            key={post.reportId}
                            className="flex justify-between items-center p-4 border border-gray-700 rounded hover:shadow transition"
                        >
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white">
                                    {post.reportedUsername?.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{post.reportedUsername}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Reported by: <span className="text-white font-medium">{post.reporterUsername}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Reason: <span className="text-red-400">{post.reason}</span> •{" "}
                                        {new Date(post.reportedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleViewPost(post.reportedPostId)}
                                    className="flex items-center gap-1 border px-3 py-1 rounded text-sm font-medium hover:bg-gray-800"
                                >
                                    👁 View
                                </button>
                                <button
                                    onClick={() => handleRemovePost(post.reportedPostId)}
                                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
                                >
                                    🗑 Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 📦 Post Modal */}
            {selectedPost && (
                <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
            )}
        </div>
    );
}
