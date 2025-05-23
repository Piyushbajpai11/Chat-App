import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001");

interface Message {
    user: string;
    text: string;
    time: string;
}

const Chat: React.FC = () => {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [joined, setJoined] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    let typingTimeout: NodeJS.Timeout;

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                user: username,
                text: message,
                time: new Date().toLocaleTimeString(),
            };
            socket.emit("send_message", newMessage);
            setMessage("");
            socket.emit("stop_typing", username); // ✅ send username explicitly
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        socket.emit("typing", username); // ✅ send username explicitly
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit("stop_typing", username); // ✅ send username explicitly
        }, 1000);
    };

    useEffect(() => {
        socket.on("user_typing", (user: string) => {
            setTypingUser(user);
        });

        socket.on("user_stop_typing", () => {
            setTypingUser(null);
        });

        return () => {
            socket.off("user_typing");
            socket.off("user_stop_typing");
        };
    }, []);

    useEffect(() => {
        socket.on("online_users", (users: string[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off("online_users");
        };
    }, []);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to socket server: ", socket.id);
        });

        socket.on("receive_message", (data: Message) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off("receive_message");
            socket.off("connect");
        };
    }, []);

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl mb-4">Enter your name to join</h1>
                <input
                    className="border p-2 rounded mb-4"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button
                    onClick={() => {
                        setJoined(true);
                        socket.emit("join_chat", username);
                    }}
                    className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-500 hover:to-blue-700 active:scale-95 focus:outline-none"
                >
                    Join Chat
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-5xl mx-auto h-screen flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Chat Room</h2>

            <div className="flex flex-1 border rounded bg-gray-100 overflow-hidden mb-4">
                <div className="w-64 border-r p-4 bg-white flex flex-col overflow-y-auto">
                    <h3 className="font-semibold text-lg mb-4">Online Users</h3>
                    <ul className="space-y-3 overflow-y-auto">
                        {onlineUsers.map((user, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 transition rounded-lg p-2"
                            >
                                <img
                                    src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${user}`}
                                    alt={`${user} avatar`}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="text-sm font-medium text-blue-900">{user}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className="mb-2">
                            {msg.user === "System" ? (
                                <div className="text-center text-gray-500 italic text-sm">
                                    {msg.text} <span className="text-xs ml-1">[{msg.time}]</span>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <img
                                        src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${msg.user}`}
                                        alt={`${msg.user} avatar`}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                        <div className="font-bold">{msg.user}</div>
                                        <div>{msg.text}</div>
                                        <div className="text-sm text-gray-500">[{msg.time}]</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {typingUser && typingUser !== username && (
                        <div className="text-sm text-gray-500 italic mt-2">{typingUser} is typing...</div>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <input
                    className="flex-1 border rounded p-2"
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 hover:from-green-500 hover:to-green-700 active:scale-95 focus:outline-none"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
