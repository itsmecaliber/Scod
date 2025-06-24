import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Home, MessageCircle, PlusSquare, Briefcase } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const BACKEND_BASE_URL = "https://scod.onrender.com";

const ChatPage = () => {
    const { receiverId } = useParams();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [currentUserId, setCurrentUserId] = useState(null);
    const [chatPartners, setChatPartners] = useState([]);
    const [receiverProfile, setReceiverProfile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch(`${BACKEND_BASE_URL}/api/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setCurrentUserId(data.userId);
            } catch (err) {
                console.error("❌ Error loading current user", err);
            }
        };
        loadUser();
    }, [token]);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await fetch(`${BACKEND_BASE_URL}/api/message/chat-partners`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                let data = await res.json();
                console.log("✅ Chat partners fetched:", data);

                // Fetch profile data for each partner to get profilePic
                const enrichedData = await Promise.all(
                    data.map(async (user) => {
                        try {
                            const profileRes = await fetch(`${BACKEND_BASE_URL}/api/profile/${user.userId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            const profileData = await profileRes.json();
                            return { ...user, profilePic: profileData.profilePic };
                        } catch (profileErr) {
                            console.error(`❌ Failed to fetch profile for userId: ${user.userId}`, profileErr);
                            return user;
                        }
                    })
                );

                console.log("✅ Enriched chat partners:", enrichedData);
                setChatPartners(enrichedData);
            } catch (err) {
                console.error("❌ Failed to fetch chat partners", err);
            }
        };
        fetchPartners();
    }, [token]);

    useEffect(() => {
        const fetchReceiver = async () => {
            if (!receiverId) return;
            try {
                const res = await fetch(`${BACKEND_BASE_URL}/api/profile/${receiverId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setReceiverProfile(data);
            } catch (err) {
                console.error("❌ Failed to fetch receiver profile", err);
            }
        };
        fetchReceiver();
    }, [receiverId, token]);

    useEffect(() => {
        if (!currentUserId || !receiverId) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_BASE_URL}/api/message/conversation?userId1=${currentUserId}&userId2=${receiverId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                setMessages(data);

                await fetch(`${BACKEND_BASE_URL}/api/message/mark-seen?senderId=${receiverId}&receiverId=${currentUserId}`, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err) {
                console.error("❌ Error fetching messages", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [currentUserId, receiverId, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageObj = {
            senderId: currentUserId,
            receiverId: parseInt(receiverId),
            content: newMessage,
        };

        try {
            await fetch(`${BACKEND_BASE_URL}/api/message/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(messageObj),
            });

            setMessages((prev) => [
                ...prev,
                {
                    ...messageObj,
                    senderName: "You",
                    timestamp: new Date().toISOString(),
                    seen: false,
                },
            ]);
            setNewMessage("");
        } catch (err) {
            console.error("❌ Failed to send message", err);
        }
    };

    return (
        <div className="min-h-screen max-h-screen overflow-hidden bg-black text-white flex pt-12">
            {/* LEFT FIXED SIDEBAR */}
            <div className="w-20 h-screen fixed top-0 left-0 bg-black border-r border-gray-800 pt-24 flex flex-col items-center gap-8">
                <Home className="w-6 h-6 cursor-pointer hover:text-blue-500" onClick={() => navigate("/homepage")} />
                <MessageCircle className="w-6 h-6 cursor-pointer hover:text-blue-500" onClick={() => navigate("/chat")} />
                <PlusSquare className="w-6 h-6 cursor-pointer hover:text-blue-500" onClick={() => navigate("/create-post")} />
                <Briefcase className="w-6 h-6 cursor-pointer hover:text-blue-500" onClick={() => navigate("/jobtype")} />
            </div>

            {/* CHAT PARTNERS LIST */}
            <div className="ml-20 w-[300px] border-r border-gray-700 bg-gray-900 p-4 h-[calc(100vh-64px)] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Messages</h2>
                {chatPartners.map((user) => {
                    const fullPicUrl =
                        user.profilePic
                            ? `${BACKEND_BASE_URL}/${user.profilePic.startsWith("/") ? user.profilePic.slice(1) : user.profilePic}`
                            : null;

                    console.log(`🔍 Rendering user: ${user.profileName} | Profile Pic URL: ${fullPicUrl}`);

                    return (
                        <div
                            key={user.userId}
                            onClick={() => navigate(`/chat/${user.userId}`)}
                            className={`cursor-pointer flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 ${
                                user.userId.toString() === receiverId ? "bg-gray-700" : ""
                            }`}
                        >
                            <Avatar className="w-10 h-10">
                                <AvatarImage
                                    src={fullPicUrl || undefined}
                                    alt={user.profileName}
                                />
                                <AvatarFallback>
                                    {user.profileName ? user.profileName.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <p className="font-medium">{user.profileName}</p>
                                <p className="text-sm text-gray-400 truncate">{user.bio}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CHAT PANEL */}
            <div className="flex-1 flex flex-col p-4 h-[calc(100vh-64px)]">
                {receiverProfile && (
                    <div className="flex items-center gap-3 border-b border-gray-700 pb-3 mb-4">
                        <Avatar className="w-10 h-10 cursor-pointer" onClick={() => navigate(`/profile/${receiverId}`)}>
                            <AvatarImage
                                src={
                                    receiverProfile.profilePic
                                        ? `${BACKEND_BASE_URL}/${receiverProfile.profilePic.startsWith("/") ? receiverProfile.profilePic.slice(1) : receiverProfile.profilePic}`
                                        : undefined
                                }
                                alt={receiverProfile.profileName}
                            />
                            <AvatarFallback>
                                {receiverProfile.profileName ? receiverProfile.profileName.charAt(0).toUpperCase() : "U"}
                            </AvatarFallback>
                        </Avatar>
                        <h2
                            className="text-xl font-semibold cursor-pointer hover:underline"
                            onClick={() => navigate(`/profile/${receiverId}`)}
                        >
                            {receiverProfile.profileName}
                        </h2>
                    </div>
                )}

                {/* MESSAGE LIST */}
                <div className="flex-1 overflow-y-auto bg-gray-800 p-3 rounded-md flex flex-col space-y-3">
                    {messages.map((msg, index) => {
                        const isOwn = msg.senderId === currentUserId;
                        const time = new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        return (
                            <div key={index} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`px-4 py-2 rounded-2xl text-sm max-w-[75%] ${
                                        isOwn ? "bg-blue-600" : "bg-gray-700"
                                    }`}
                                >
                                    <p>{msg.content}</p>
                                    <div className="text-xs text-gray-300 mt-1 flex justify-end gap-2">
                                        <span>{time}</span>
                                        {isOwn && (
                                            <span className={msg.seen ? "text-green-400" : "text-gray-400"}>
                                                {msg.seen ? "Seen" : "Delivered"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT BAR */}
                <div className="mt-4 flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 rounded-l-full bg-gray-700 text-white focus:outline-none"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-full text-white font-semibold"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
