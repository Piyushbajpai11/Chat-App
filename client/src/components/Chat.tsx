import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Sun, Moon } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const socket: Socket = io("http://localhost:3001");

interface Message {
    user: string;
    text: string;
    time: string;
}

const Chat: React.FC = () => {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ [user: string]: Message[] }>({});
    const [joined, setJoined] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState<{ [user: string]: boolean }>({});

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    let typingTimeout: NodeJS.Timeout;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const addMessage = (userKey: string, msg: Message) => {
        setMessages((prev) => ({
            ...prev,
            [userKey]: [...(prev[userKey] || []), msg],
        }));
    };

    const sendMessage = () => {
        if (message.trim()) {
            if (selectedUser && selectedUser !== username) {
                socket.emit("private-message", {
                    from: username,
                    to: selectedUser,
                    message,
                });

                addMessage(selectedUser, {
                    user: `To ${selectedUser}`,
                    text: message,
                    time: new Date().toLocaleTimeString(),
                });
            } else {
                const newMessage = {
                    user: username,
                    text: message,
                    time: new Date().toLocaleTimeString(),
                };
                socket.emit("send_message", newMessage);
            }

            setMessage("");
            socket.emit("stop_typing", username);
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        socket.emit("typing", username);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit("stop_typing", username);
        }, 1000);
    };

    useEffect(() => {
        if (joined && inputRef.current) {
            inputRef.current.focus();
        }
    }, [joined]);

    useEffect(() => {
        socket.on("user_typing", (user: string) => setTypingUser(user));
        socket.on("user_stop_typing", () => setTypingUser(null));
        return () => {
            socket.off("user_typing");
            socket.off("user_stop_typing");
        };
    }, []);

    useEffect(() => {
        socket.on("online_users", (users: string[]) => setOnlineUsers(users));
        return () => socket.off("online_users");
    }, []);

    useEffect(() => {
        socket.on("connect", () => console.log("Connected:", socket.id));

        socket.on("private-message", ({ from, message }) => {
            addMessage(from, {
                user: `From ${from}`,
                text: message,
                time: new Date().toLocaleTimeString(),
            });

            if (selectedUser !== from) {
                setUnreadMessages((prev) => ({ ...prev, [from]: true }));
                toast.success(`New private message from ${from}`);
            }
        });

        socket.on("receive_message", (data: Message) => {
            addMessage("public", data);
        });

        return () => {
            socket.off("receive_message");
            socket.off("private-message");
            socket.off("connect");
        };
    }, [selectedUser]);

    useEffect(() => scrollToBottom(), [messages, typingUser]);

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
                <h1 className="text-3xl font-bold mb-6">Welcome to Chat</h1>
                <input
                    className="border rounded-lg px-4 py-2 mb-4 w-64 shadow-sm dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button
                    onClick={() => {
                        setJoined(true);
                        socket.emit("join_chat", username);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                    Join Chat
                </button>
            </div>
        );
    }

    return (
        <div className={`${darkMode ? "dark" : ""} h-screen`}>
            <Toaster />
            <div className="relative h-full bg-white dark:bg-gray-900 text-black dark:text-white max-w-6xl mx-auto p-4 shadow-md rounded-lg">
                <button
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700"
                    onClick={() => setDarkMode((prev) => !prev)}
                >
                    {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-800" />}
                </button>

                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold">{username}</h1>
                    <h2 className="text-sm text-gray-500 dark:text-gray-300">
                        {selectedUser ? `💬 Chat with ${selectedUser}` : "🌐 Public Chat Room"}
                    </h2>
                </div>

                <div className="flex flex-1 overflow-hidden border dark:border-gray-600 rounded-lg h-[calc(100%-120px)]">
                    {/* Sidebar */}
                    <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
                        <h3 className="font-semibold text-lg mb-3">Online Users</h3>
                        <ul className="space-y-3">
                            {onlineUsers.map((user, i) => (
                                <li
                                    key={i}
                                    onClick={() => {
                                        setSelectedUser(selectedUser === user ? null : user);
                                        setUnreadMessages((prev) => ({ ...prev, [user]: false }));
                                    }}
                                    className={`relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition
                    ${selectedUser === user ? "bg-green-200 border border-green-500" : "hover:bg-blue-100 dark:hover:bg-gray-700"}`}
                                >
                                    {unreadMessages[user] && (
                                        <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                                    )}
                                    <img
                                        src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${user}`}
                                        className="w-8 h-8 rounded-full"
                                        alt={`${user} avatar`}
                                    />
                                    <span className="text-sm font-medium">{user}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col justify-between p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                            {(messages[selectedUser || "public"] || []).map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.user.includes("To") || msg.user === username ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`rounded-xl px-4 py-2 max-w-xs shadow ${msg.user.includes("To") || msg.user === username
                                            ? "bg-blue-500 text-white"
                                            : "bg-white border text-gray-800 dark:bg-gray-700 dark:text-white"
                                            }`}
                                    >
                                        <div className="text-xs font-semibold mb-1">{msg.user}</div>
                                        <div>{msg.text}</div>
                                        <div className="text-[10px] text-right opacity-60">{msg.time}</div>
                                    </div>
                                </div>
                            ))}
                            {typingUser && typingUser !== username && (
                                <div className="text-sm italic text-gray-500 dark:text-gray-300">
                                    {typingUser} is typing...
                                </div>
                            )}
                            <div ref={messagesEndRef}></div>
                        </div>

                        {/* Input */}
                        <div className="mt-4 flex items-center gap-2">
                            <input
                                ref={inputRef}
                                className="flex-1 border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                type="text"
                                placeholder="Type your message..."
                                value={message}
                                onChange={handleTyping}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            />
                            <button
                                onClick={sendMessage}
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
