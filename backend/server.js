const express = require("express");
const dotenv = require("dotenv");
const chats = require("./data/data.js");
const connectDB = require("./config/db.js");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const notifRoutes = require("./routes/notifRoutes.js");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");
const path = require("path");
const http = require("http");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// API routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notifRoutes);

// Deployment: Serve frontend in production
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname1, "/frontend/build")));
	app.get("*", (req, res) =>
		res.sendFile(
			path.resolve(__dirname1, "frontend", "build", "index.html")
		)
	);
} else {
	app.get("/", (req, res) => {
		res.send("API is running successfully");
	});
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Create HTTP server for Socket.IO
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = require("socket.io")(server, {
	pingTimeout: 60000,
	cors: {
		origin: "*", // Or your frontend URL for more security
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log("Connected to socket.io!");

	socket.on("setup", (userData) => {
		socket.join(userData._id);
		socket.emit("connected");
	});

	socket.on("join chat", (room) => {
		socket.join(room);
		console.log("User Joined Room: " + room);
	});

	socket.on("typing", (room) => socket.in(room).emit("typing"));
	socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

	socket.on("new message", (newMessageRecieved) => {
		var chat = newMessageRecieved.chat;
		if (!chat.users) return console.log("chat.users not defined!");

		chat.users.forEach((user) => {
			if (user._id == newMessageRecieved.sender._id) return;
			socket.in(user._id).emit("message recieved", newMessageRecieved);
		});
	});

	socket.off("setup", () => {
		console.log("USER DISCONNECTED");
		// userData is not defined here, so can't leave the room
	});
});

server.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`.blue.bold);
	console.log(`SocketIO initialised on port ${PORT}`.bgCyan);
});
