import React, { useState, useEffect } from 'react';

/**
 * Avatar component displays a user's profile picture or initials fallback.
 *
 * Props:
 * - src: string (URL or relative path to the image)
 * - alt: string (alternative text)
 * - size: one of "xs", "sm", "md", "lg"
 * - initials: fallback initials to show if image fails
 */
const Avatar = ({ src, alt, size = "md", initials }) => {
  const sizes = {
    xs: "w-8 h-8 text-xs",         // 32px
    sm: "w-12 h-12 text-base",     // 48px
    md: "w-28 h-28 text-4xl",      // 112px
    lg: "w-40 h-40 text-6xl",      // 160px
  };

  const BASE_URL = "http://localhost:8080";

  // Resolve full source URL or null if invalid
  const fullSrc =
    src && (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:"))
      ? src
      : src
        ? `${BASE_URL}${src}`
        : null;

  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const handleClick = () => {
    if (!imgError && fullSrc) {
      setShowModal(true);
    }
  };

  const handleClose = () => setShowModal(false);

  return (
    <>
      {/* Avatar Image or Fallback */}
      {!imgError && fullSrc ? (
        <img
          src={fullSrc || undefined} // ensure it's never empty string
          alt={alt || "Avatar"}
          className={`rounded-full object-cover border-2 border-gray-700 cursor-pointer ${sizes[size]}`}
          onClick={handleClick}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          role="img"
          aria-label={alt || "User avatar"}
          className={`flex items-center justify-center rounded-full bg-gray-700 text-white font-bold border-2 border-gray-700 ${sizes[size]}`}
        >
          {initials || "?"}
        </div>
      )}

      {/* Modal Preview */}
      {showModal && fullSrc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={handleClose}
        >
          <img
            src={fullSrc}
            alt={alt || "Full size avatar"}
            className="max-w-full max-h-full object-contain p-4 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default Avatar;
