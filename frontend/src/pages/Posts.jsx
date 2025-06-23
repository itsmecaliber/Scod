import React, { useState, useEffect } from "react";

const Skeleton = () => {
  return (
    <div
      style={{
        backgroundColor: "#ddd",
        height: "1rem",
        width: "100%",
        borderRadius: "4px",
        marginBottom: "0.5rem",
        animation: "pulse 1.5s infinite",
      }}
    />
  );
};

const Posts = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fake API fetch delay
    setTimeout(() => {
      setPosts([
        { id: 1, title: "First post" },
        { id: 2, title: "Second post" },
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}
      </style>
      <div style={{ maxWidth: "400px", margin: "auto" }}>
        <h2>Posts</h2>
        {loading
          ? // Show 3 skeleton lines while loading
            [1, 2, 3].map((n) => <Skeleton key={n} />)
          : // Show posts when loaded
            posts.map((post) => (
              <div
                key={post.id}
                style={{
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                {post.title}
              </div>
            ))}
      </div>
    </>
  );
};

export default Posts;
