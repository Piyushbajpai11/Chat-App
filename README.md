# 💬 Real-Time WebSocket Chat App

A minimal real-time chat application built using **Node.js**, **Express**, **Socket.IO**, and **React (TypeScript)**. It supports group messaging, live typing indicators, user join/leave alerts, online users list, and avatar-based UI using DiceBear.

---

## 🚀 Features

- ✅ Real-time messaging with Socket.IO
- ✅ Typing indicators ("user is typing...")
- ✅ Online users list with avatars
- ✅ Join/leave system messages
- ✅ Clean, responsive UI with Tailwind CSS

---

## 🛠 Tech Stack

### 🔗 Frontend
- **React + TypeScript**
- **Tailwind CSS**
- **Socket.IO Client**
- DiceBear Avatars (for profile icons)

### 🔌 Backend
- **Node.js + Express**
- **Socket.IO Server**
- **CORS** support

---

## 📸 Demo Screenshots

> Add screenshots or a screen recording here once available.

---

## 📁 Project Structure

```bash
├── client/                # React + TS frontend
│   └── src/
│       └── Chat.tsx       # Main chat UI component
├── server/                # Express + Socket.IO backend
│   └── index.js           # WebSocket logic
├── .gitignore
├── README.md
```

## 📦 Installation

# 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/websocket-chat-app.git
cd websocket-chat-app
```

# 2. Setup Backend

```bash
cd server
npm install
npm run dev  # or node index.js
```

# 3. Setup Frontend

```bash
cd client
npm install
npm run dev  # or npm run build
```

## 🌐 Local Development URLs

1. Frontend: `http://localhost:5173`
2. Backend: `http://localhost:3001`

---

## 📝 License

This project is licensed under the MIT License.

---

## ✨ Future Improvements
🔒 Private messaging

💬 Chat room support

💾 Message persistence with MongoDB

📱 Mobile responsiveness enhancements

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first.