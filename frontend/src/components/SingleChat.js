import React, { useEffect, useState, useRef } from "react";
import { ChatState } from "../Context/ChatProvider";
import { Box, Text } from "@chakra-ui/layout";
import {
	FormControl,
	IconButton,
	Input,
	Spinner,
	useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

const ENDPOINT =
	process.env.NODE_ENV === "production"
		? window.location.origin
		: "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [newMessage, setNewMessage] = useState("");
	const [socketConnected, setSocketConnected] = useState(false);
	const [typing, setTyping] = useState(false);
	const [isTyping, setIsTyping] = useState(false);

	const fileInputRef = useRef(null);

	const defaultOptions = {
		loop: true,
		autoplay: true,
		animationData: animationData,
		rendererSettings: {
			preserveAspectRatio: "xMidYMid slice",
		},
	};

	const toast = useToast();
	const {
		user,
		selectedChat,
		setSelectedChat,
		notification,
		setNotification,
	} = ChatState();

	const fetchMessages = async () => {
		if (!selectedChat) return;

		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};

			setLoading(true);

			const { data } = await axios.get(
				`/api/message/${selectedChat._id}`,
				config
			);

			setMessages(data);
			setLoading(false);

			socket.emit("join chat", selectedChat._id);
		} catch (error) {
			toast({
				title: "Error Occured!",
				description: "Failed to Load the Messages",
				status: "Error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	useEffect(() => {
		socket = io(ENDPOINT);
		socket.emit("setup", user);
		socket.on("connected", () => setSocketConnected(true));
		socket.on("typing", () => setIsTyping(true));
		socket.on("stop typing", () => setIsTyping(false));
	}, []);

	useEffect(() => {
		fetchMessages();

		selectedChatCompare = selectedChat;
	}, [selectedChat]);

	useEffect(() => {
		socket.on("message recieved", (newMessageRecieved) => {
			if (
				!selectedChatCompare ||
				selectedChatCompare._id !== newMessageRecieved.chat._id
			) {
				if (!notification.includes(newMessageRecieved)) {
					setNotification([newMessageRecieved, ...notification]);
					setFetchAgain(!fetchAgain);
				}
			} else {
				setMessages([...messages, newMessageRecieved]);
			}
		});
	});

	const sendMessage = async (event) => {
		if (event.key === "Enter" && newMessage) {
			socket.emit("stop typing", selectedChat._id);
			try {
				const config = {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${user.token}`,
					},
				};

				setNewMessage("");
				const { data } = await axios.post(
					"/api/message",
					{
						content: newMessage,
						chatId: selectedChat._id,
					},
					config
				);

				socket.emit("new message", data);
				setMessages([...messages, data]);
			} catch (error) {
				toast({
					title: "Error Occured!",
					description: "Failed to send the Message",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
			}
		}
	};

	const typingHandler = (e) => {
		setNewMessage(e.target.value);

		// Typing indicator logic
		if (!socketConnected) return;

		if (!typing) {
			setTyping(true);
			socket.emit("typing", selectedChat._id);
		}

		let lastTypingTime = new Date().getTime();
		var timerLength = 3000;
		setTimeout(() => {
			var timerNow = new Date().getTime();
			var timeDiff = timerNow - lastTypingTime;

			if (timeDiff >= timerLength && typing) {
				socket.emit("stop typing", selectedChat._id);
				setTyping(false);
			}
		}, timerLength);
	};

	const handleImageChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// 1. Upload to Cloudinary
		const data = new FormData();
		data.append("file", file);
		data.append("upload_preset", "Jeff-Chat"); // Your Cloudinary preset
		data.append("cloud_name", "dhwmksior"); // Your Cloudinary cloud name

		try {
			const res = await fetch(
				"https://api.cloudinary.com/v1_1/dhwmksior/image/upload",
				{
					method: "POST",
					body: data,
				}
			);
			const imgData = await res.json();
			if (!imgData.url) {
				throw new Error("Image upload failed");
			}

			// 2. Send as a message
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user.token}`,
				},
			};
			const { data: messageData } = await axios.post(
				"/api/message",
				{
					content: "", // No text, just image
					chatId: selectedChat._id,
					image: imgData.url, // <-- Add this field
				},
				config
			);

			socket.emit("new message", messageData);
			setMessages((prev) => [...prev, messageData]);
			toast({
				title: "Image sent!",
				status: "success",
				duration: 3000,
				isClosable: true,
				position: "bottom",
			});
		} catch (error) {
			toast({
				title: "Image upload failed",
				description: error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	return (
		<>
			{selectedChat ? (
				<>
					<Text
						fontSize={{ base: "28px", md: "30px" }}
						pb={3}
						px={2}
						w="100%"
						fontFamily="Work sans"
						fontStyle="normal"
						fontWeight={300}
						display="flex"
						justifyContent={{ base: "space-between" }}
						alignItems="center"
					>
						<IconButton
							display={{ base: "flex", md: "none" }}
							icon={<ArrowBackIcon />}
							onClick={() => setSelectedChat("")}
						/>

						{!selectedChat.isGroupChat ? (
							<>
								{getSender(user, selectedChat.users)}
								<ProfileModal
									user={getSenderFull(
										user,
										selectedChat.users
									)}
								/>
							</>
						) : (
							<>
								{selectedChat.chatName.toUpperCase()}
								<UpdateGroupChatModal
									fetchAgain={fetchAgain}
									setFetchAgain={setFetchAgain}
									fetchMessages={fetchMessages}
								/>
							</>
						)}
					</Text>
					<Box
						display="flex"
						flexDir="column"
						justifyContent="flex-end"
						p={3}
						bg="#E8E8E8"
						w="100%"
						h="100%"
						borderRadius="lg"
						overflowY="hidden"
					>
						{loading ? (
							<Spinner
								size="xl"
								w={20}
								h={20}
								alignSelf="center"
								margin="auto"
							/>
						) : (
							<div className="messages">
								<ScrollableChat messages={messages} />
							</div>
						)}

						<FormControl onKeyDown={sendMessage} isRequired mt={3}>
							{isTyping ? (
								<div>
									<Lottie
										options={defaultOptions}
										width={70}
										style={{
											marginBottom: 15,
											marginLeft: 0,
										}}
									/>
								</div>
							) : (
								<></>
							)}
							<Box display="flex" alignItems="center">
								<Input
									variant="filled"
									bg="#E0E0E0"
									placeholder="Say Hi..."
									onChange={typingHandler}
									value={newMessage}
								/>
								<input
									type="file"
									accept="image/*"
									style={{ display: "none" }}
									ref={fileInputRef}
									onChange={handleImageChange}
								/>
								<IconButton
									icon={<i className="fas fa-image"></i>}
									onClick={() => fileInputRef.current.click()}
									variant="ghost"
									size="sm"
									ml={2}
									aria-label="Send Image"
								/>
							</Box>
						</FormControl>
					</Box>
				</>
			) : (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					h="100%"
				>
					<Text
						fontSize="3xl"
						pb={3}
						fontFamily="Work Sans"
						fontStyle="normal"
						fontWeight={300}
					>
						Click on a user to start chatting!
					</Text>
				</Box>
			)}
		</>
	);
};

export default SingleChat;
