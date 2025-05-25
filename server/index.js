import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const users = new Map();
const connectedUsers = new Map();

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("join_chat", (username) => {
        connectedUsers.set(username, socket.id);
        users.set(socket.id, username);
        socket.username = username;

        socket.broadcast.emit("receive_message", {
            user: "System",
            text: `👋 ${username} has joined the chat`,
            time: new Date().toLocaleTimeString()
        });

        io.emit("online_users", Array.from(connectedUsers.keys()));
    });

    socket.on('private-message', ({ to, from, message }) => {
        const targetSocketId = connectedUsers.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('private-message', { from, message }); // ✅ Fixed
        }
    });


    socket.on("send_message", (data) => {
        console.log("📨 Message received:", data);
        io.emit("receive_message", data);
    });

    //use explicit username from client
    socket.on("typing", (username) => {
        socket.broadcast.emit("user_typing", username);
    });

    socket.on("stop_typing", (username) => {
        socket.broadcast.emit("user_stop_typing", username);
    });

    socket.on("disconnecting", () => {
        const username = users.get(socket.id); // socket.id -> username

        if (username) {
            connectedUsers.delete(username);
            users.delete(socket.id);

            socket.broadcast.emit("receive_message", {
                user: "System",
                text: `👤 ${username} has left the chat.`,
                time: new Date().toLocaleTimeString()
            });

            io.emit("online_users", Array.from(connectedUsers.keys())); // send updated usernames
        }

        console.log("🔴 Client disconnected:", socket.id);
    });


    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
    });
});

server.listen(3001, () => {
    console.log("✅ Server running on http://localhost:3001");
});
