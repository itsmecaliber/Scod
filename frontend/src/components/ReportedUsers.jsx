import React, { useEffect, useState } from "react";

export default function ReportedUsers() {
    const [reportedUsers, setReportedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewUser, setViewUser] = useState(null);
    const [profileData, setProfileData] = useState(null);

    const fetchReportedUsers = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/admin/reports/users", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();
            setReportedUsers(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleBanToggle = async (userId, isBanned) => {
        const endpoint = isBanned
            ? `http://localhost:8080/api/admin/reports/users/${userId}/unban`
            : `http://localhost:8080/api/admin/reports/users/${userId}/ban`;

        try {
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (res.ok) {
                fetchReportedUsers(); // Refresh after update
            } else {
                alert("Failed to update user status");
            }
        } catch (err) {
            console.error("Ban/unban error", err);
        }
    };

    const handleView = async (userId) => {
        try {
            const res = await fetch(`http://localhost:8080/api/profile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();
            setProfileData(data);
            setViewUser(userId);
        } catch (err) {
            console.error("Failed to fetch profile", err);
            alert("Error fetching profile details.");
        }
    };

    const closeModal = () => {
        setViewUser(null);
        setProfileData(null);
    };

    useEffect(() => {
        fetchReportedUsers();
    }, []);

    return (
        <div className="bg-black text-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-1">👥 Reported Users</h2>
            <p className="text-gray-400 mb-4">Review and moderate reported accounts</p>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <div className="space-y-4">
                    {reportedUsers.map((user) => (
                        <div
                            key={user.reportId}
                            className="flex justify-between items-center p-4 border border-gray-700 rounded hover:shadow transition"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white">
                                    {user.reportedUsername?.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{user.reportedUsername}</h3>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.status === "active"
                                                ? "bg-green-800 text-green-200"
                                                : "bg-red-800 text-red-200"
                                                }`}
                                        >
                                            {user.status || "unknown"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Reported by: {user.reporterUsername}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Reason: {user.reason} • At:{" "}
                                        {new Date(user.reportedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (user.reportedUserId) {
                                            handleView(user.reportedUserId);
                                        } else {
                                            alert("User ID not available for view.");
                                        }
                                    }}
                                    className="flex items-center gap-1 border px-3 py-1 rounded text-sm font-medium hover:bg-gray-800"
                                >
                                    👁 View
                                </button>
                                <button
                                    onClick={() => {
                                        if (user.reportedUserId) {
                                            handleBanToggle(user.reportedUserId, user.status === "banned");
                                        } else {
                                            alert("User ID not available for banning.");
                                        }
                                    }}
                                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium ${user.status === "banned"
                                        ? "bg-gray-700 text-white hover:opacity-90"
                                        : "bg-red-600 text-white hover:bg-red-700"
                                        }`}
                                >
                                    {user.status === "banned" ? "🔓 Unban" : "🚫 Ban"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Profile Modal */}
            {viewUser && profileData && (
                <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-900 text-white rounded-lg p-6 w-[90%] max-w-md shadow-lg relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-3 text-white text-xl"
                        >
                            ✖
                        </button>
                        <div className="text-center">
                            <img
                                src={profileData.profilePic || "/default-avatar.png"}
                                alt="profile"
                                className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border"
                            />
                            <h2 className="text-xl font-bold">{profileData.profileName}</h2>
                            <p className="text-gray-400">@{profileData.username}</p>
                            <p className="text-gray-300 mt-3">{profileData.bio}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
