const express = require("express");
const router = express.Router();
const Notification = require("../models/notifModel");
const { protect } = require("../middleware/authMiddleware");

// Get notifications for user
router.get("/", protect, async (req, res) => {
	const notifications = await Notification.find({
		user: req.user._id,
		isRead: false,
	})
		.populate({
			path: "chat",
			populate: { path: "users", select: "name pic email" },
		})
		.populate("message");
	res.json(notifications);
});

// Mark all notifications as read
router.put("/markall/read", protect, async (req, res) => {
	try {
		await Notification.updateMany(
			{ user: req.user._id, isRead: false },
			{ isRead: true }
		);
		res.json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
});

// Mark notif as read
router.put("/:id/read", protect, async (req, res) => {
	const notif = await Notification.findByIdAndUpdate(
		req.params.id,
		{ isRead: true },
		{ new: true }
	);
	res.json(notif);
});

// Delete notification
router.delete("/:id", protect, async (req, res) => {
	await Notification.findByIdAndDelete(req.params.id);
	res.json({ success: true });
});

module.exports = router;
