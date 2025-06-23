import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReportedUsers from "../components/ReportedUsers";
import ReportedPosts from "../components/ReportedPosts";
import BoostRequests from "../components/BoostRequests";

export default function Admin() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("Overview");

    const [totalUsers, setTotalUsers] = useState("12,847");
    const [totalPosts, setTotalPosts] = useState("5,234");
    const [pendingReports, setPendingReports] = useState("23");

    // ✅ Admin access check
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            if (!decoded || !decoded.isAdmin) {
                navigate("/");
            }
        } catch (err) {
            console.error("Invalid token:", err);
            navigate("/");
        }
    }, [navigate]);


    useEffect(() => {
        const token = localStorage.getItem("token"); // ✅ Get token
        fetch("http://localhost:8080/api/admin/stats", {
            headers: {
                Authorization: `Bearer ${token}`, // ✅ Add Authorization header
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch stats");
                return res.json();
            })
            .then((data) => {
                setTotalUsers(data.totalUsers.toLocaleString());
                setTotalPosts(data.totalPosts.toLocaleString());
                setPendingReports(data.pendingReports.toString());
            })
            .catch((err) => {
                console.error("Error fetching stats:", err);
            });
    }, []);

    return (
        <div className="min-h-screen bg-black text-white pt-20 px-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 text-white px-3 py-1 rounded-full font-bold">GA</div>
                    <h1 className="text-2xl font-semibold">GamersAdmin</h1>
                    <span className="text-sm bg-green-700 text-white px-2 py-1 rounded ml-2">Online</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-semibold">Admin</span>
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">AD</div>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-3xl font-bold">Admin Dashboard</h2>
                <p className="text-gray-400">Manage your gaming social platform</p>
            </div>

            <div className="flex gap-4 mb-6">
                {["Overview", "Users", "Posts", "Boosts"].map((name) => (
                    <button
                        key={name}
                        onClick={() => setTab(name)}
                        className={`px-4 py-2 rounded font-medium ${tab === name
                            ? "bg-gray-800 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            {tab === "Users" && <ReportedUsers />}
            {tab === "Posts" && <ReportedPosts />}
            {tab === "Boosts" && <BoostRequests />}

            {tab === "Overview" && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard title="Total Users" value={totalUsers} change="+12%" />
                        <StatCard title="Total Posts" value={totalPosts} change="+8%" />
                        <StatCard title="Pending Reports" value={pendingReports} change="-15%" warning />
                        <StatCard title="Boost Revenue" value="$2,847" change="+23%" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-[#1a1a1a] rounded-lg shadow p-4">
                            <h3 className="text-lg font-semibold mb-2">👁️ Recent Activity</h3>
                            <p className="text-sm text-gray-400 mb-4">Latest actions in your platform</p>
                            <ul className="space-y-3 text-sm">
                                <ActivityItem color="red" text="User @gamerPro banned" time="2 minutes ago" />
                                <ActivityItem color="orange" text="Post #1234 removed" time="5 minutes ago" />
                                <ActivityItem color="yellow" text="Report resolved" time="12 minutes ago" />
                                <ActivityItem color="purple" text="Post boosted by @esportsTeam" time="18 minutes ago" />
                                <ActivityItem color="green" text="New user registered" time="25 minutes ago" />
                            </ul>
                        </div>

                        <div className="bg-[#1a1a1a] rounded-lg shadow p-4">
                            <h3 className="text-lg font-semibold mb-2">📈 Platform Growth</h3>
                            <p className="text-sm text-gray-400 mb-4">User engagement metrics</p>
                            <div className="text-sm space-y-2">
                                <GrowthItem label="Daily Active Users" value="3,247" />
                                <GrowthItem label="Posts per Day" value="847" />
                                <GrowthItem label="Avg. Session Duration" value="12m 34s" />
                                <GrowthItem label="Conversion Rate" value="4.2%" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ title, value, change, warning }) {
    const isNegative = change.startsWith("-");
    const changeColor = warning
        ? "text-red-500 bg-red-800"
        : isNegative
            ? "text-red-500 bg-red-800"
            : "text-green-400 bg-green-900";

    return (
        <div className="bg-[#1a1a1a] rounded-lg shadow p-4">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <span className={`text-xs px-2 py-1 rounded ${changeColor} inline-block mt-1`}>
                {change} {title === "Pending Reports" ? "Reports awaiting review" : ""}
            </span>
        </div>
    );
}

function ActivityItem({ color, text, time }) {
    const dotColors = {
        red: "bg-red-500",
        orange: "bg-orange-500",
        yellow: "bg-yellow-400",
        purple: "bg-purple-500",
        green: "bg-green-500",
    };

    return (
        <li className="flex justify-between items-center text-gray-300">
            <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColors[color]}`} />
                <span>{text}</span>
            </div>
            <span className="text-gray-500 text-xs">{time}</span>
        </li>
    );
}

function GrowthItem({ label, value }) {
    return (
        <div className="flex justify-between text-gray-300">
            <span>{label}</span>
            <span className="font-semibold text-white">{value}</span>
        </div>
    );
}
