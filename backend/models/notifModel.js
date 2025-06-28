const mongoose = require("mongoose");

const notifSchema = mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
		message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Notification", notifSchema);
