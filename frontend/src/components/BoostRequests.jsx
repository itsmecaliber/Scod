import React from "react";

const boostRequests = [
    {
        id: 201,
        username: "ProGamingOrg",
        title: "Exciting tournament announcement! Register now for the biggest gaming event...",
        amount: "$99.99",
        status: "pending",
        duration: "14 days",
        impressions: 0,
        clicks: 0,
        ctr: "0%",
        startDate: "2024-01-20",
        endDate: "2024-02-03",
    },
    {
        id: 202,
        username: "IndieGameDev",
        title: "Check out our new indie game! Early access available now...",
        amount: "$29.99",
        status: "completed",
        duration: "3 days",
        impressions: 8965,
        clicks: 156,
        ctr: "1.74%",
        startDate: "2024-01-10",
        endDate: "2024-01-13",
    },
];

const statusStyles = {
    active: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700",
    pending: "bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700",
    completed: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600",
};

export default function BoostRequests() {
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-1">🚀 Boost Requests</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
                Manage post boosts and approve pending requests
            </p>

            <div className="space-y-4">
                {boostRequests.map((req) => (
                    <div
                        key={req.id}
                        className={`border rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center ${statusStyles[req.status] || ""}`}
                    >
                        <div className="mb-2 md:mb-0">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">
                                    {req.username.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-semibold">{req.username}</span>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${req.status === "active"
                                        ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                                        : req.status === "pending"
                                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300"
                                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        }`}
                                >
                                    {req.status}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300 font-semibold">
                                    {req.amount}
                                </span>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{req.title}</p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div>
                                    <strong>Duration:</strong> {req.duration}
                                </div>
                                <div>
                                    <strong>Impressions:</strong> {req.impressions}
                                </div>
                                <div>
                                    <strong>Clicks:</strong> {req.clicks}
                                </div>
                                <div>
                                    <strong>CTR:</strong> {req.ctr}
                                </div>
                                <div>
                                    <strong>Start:</strong> {req.startDate}
                                </div>
                                <div>
                                    <strong>End:</strong> {req.endDate}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-3 md:mt-0">
                            <button className="flex items-center gap-1 border px-3 py-1 rounded text-sm font-medium text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                👁 Details
                            </button>
                            {req.status === "pending" && (
                                <>
                                    <button className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
                                        ✅ Approve
                                    </button>
                                    <button className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600">
                                        ❌ Reject
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
