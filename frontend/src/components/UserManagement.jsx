import React, { useState } from "react";

const initialUsers = [
    { id: 1, username: "gamerPro2024", isBanned: false },
    { id: 2, username: "suspiciousUser", isBanned: true },
    { id: 3, username: "EsportsTeamAlpha", isBanned: false },
];

export default function UserManagement() {
    const [users, setUsers] = useState(initialUsers);

    const toggleBan = (id) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === id ? { ...user, isBanned: !user.isBanned } : user
            )
        );
    };

    return (
        <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <ul className="space-y-4">
                {users.map((user) => (
                    <li
                        key={user.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                    >
                        <div>
                            <p className="font-semibold">{user.username}</p>
                            <p
                                className={`text-sm ${user.isBanned ? "text-red-500" : "text-green-600"
                                    }`}
                            >
                                Status: {user.isBanned ? "Banned" : "Active"}
                            </p>
                        </div>
                        <button
                            onClick={() => toggleBan(user.id)}
                            className={`px-4 py-1 rounded text-white font-medium ${user.isBanned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            {user.isBanned ? "Unban" : "Ban"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
