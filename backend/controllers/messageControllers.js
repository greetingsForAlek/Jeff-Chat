const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Notification = require("../models/notifModel");

const sendMessage = asyncHandler(async (req, res) => {
	const { content, chatId, image } = req.body; // <-- add image

	if ((!content && !image) || !chatId) {
		// allow either content or image
		console.log("Invalid data passed into request");
		return res.sendStatus(400);
	}

	var newMessage = {
		sender: req.user._id,
		content: content,
		image: image, // <-- add image
		chat: chatId,
	};

	try {
		var message = await Message.create(newMessage);

		message = await message.populate("sender", "name pic");
		message = await message.populate("chat");
		message = await User.populate(message, {
			path: "chat.users",
			select: "name pic email",
		});

		await Chat.findByIdAndUpdate(req.body.chatId, {
			latestMessage: message,
		});

		// NOTIFICATION DATABASE STUFF
		const chat = message.chat;
		for (const user of chat.users) {
			if (user._id.toString() !== req.user._id.toString()) {
				await Notification.create({
					user: user._id,
					chat: chat._id,
					message: message._id,
				});
			}
		}

		res.json(message);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

module.exports = { sendMessage };
