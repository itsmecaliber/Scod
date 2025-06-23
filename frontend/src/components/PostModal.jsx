import React from "react";

const BACKEND_BASE_URL = "http://localhost:8080/";

const PostModal = ({ post, onClose }) => {
  if (!post) return null;

  const handleReport = () => {
    // Replace this with real API call when ready
    alert(`Reported post with ID: ${post.id}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 text-white rounded-xl w-full max-w-3xl p-6 flex flex-col gap-6 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-2xl text-gray-300 hover:text-red-500"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Media and info */}
        <div>
          {post.mediaPath && (
            <div className="rounded-lg overflow-hidden mb-4">
              {post.mediaType?.startsWith("video") ? (
                <video
                  src={`${BACKEND_BASE_URL}${post.mediaPath}`}
                  controls
                  className="w-full rounded"
                />
              ) : (
                <img
                  src={`${BACKEND_BASE_URL}${post.mediaPath}`}
                  alt="post media"
                  className="w-full rounded object-cover"
                />
              )}
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>
              Posted by: <strong>{post.username}</strong>
            </span>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Caption & Description */}
        <div className="space-y-3">
          {post.title && (
            <div>
              <p className="text-lg font-semibold text-white">{post.title}</p>
            </div>
          )}
          {post.content && (
            <div>
              <p className="text-sm text-gray-300">{post.content}</p>
            </div>
          )}
        </div>

        {/* Report Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleReport}
            className="text-red-500 hover:underline text-sm"
          >
            Report this post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
