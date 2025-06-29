import React, { useState } from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
	isLastMessage,
	isSameSender,
	isSameSenderMargin,
	isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import {
	Tooltip,
	Avatar,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
	Button,
	useDisclosure,
} from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
	const { user } = ChatState();
	const [modalImage, setModalImage] = useState(null);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const openImageModal = (imgUrl) => {
		setModalImage(imgUrl);
		onOpen();
	};

	return (
		<>
			<ScrollableFeed>
				{messages &&
					messages.map((m, i) => (
						<div style={{ display: "flex" }} key={m._id}>
							{(isSameSender(messages, m, i, user._id) ||
								isLastMessage(messages, i, user._id)) && (
								<Tooltip
									label={m.sender.name}
									placement="bottom-start"
									hasArrow
								>
									<Avatar
										mt="7px"
										mr={1}
										size="sm"
										cursor="pointer"
										name={m.sender.name}
										src={m.sender.pic}
									/>
								</Tooltip>
							)}

							<span
								style={{
									backgroundColor: `${
										m.sender._id === user._id
											? "#BEE3F8"
											: "#B9F5D0"
									}`,
									borderRadius: "20px",
									padding: "5px 15px",
									maxWidth: "75%",
									marginLeft: isSameSenderMargin(
										messages,
										m,
										i,
										user._id
									),
									marginTop: isSameUser(
										messages,
										m,
										i,
										user._id
									)
										? 3
										: 10,
									display: "inline-block",
									wordBreak: "break-word",
								}}
							>
								{m.image ? (
									<img
										src={m.image}
										alt="sent"
										style={{
											maxWidth: "200px",
											borderRadius: "8px",
											cursor: "pointer",
											display: "block",
											margin: "0 auto",
										}}
										onClick={() => openImageModal(m.image)}
									/>
								) : (
									m.content
								)}
							</span>
						</div>
					))}
			</ScrollableFeed>

			{/* Image Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalCloseButton />
					<ModalBody>
						{modalImage && (
							<>
								<img
									src={modalImage}
									alt="full"
									style={{ width: "100%" }}
								/>
								<Button
									as="a"
									href={modalImage}
									download
									mt={4}
									colorScheme="teal"
									width="100%"
								>
									Download
								</Button>
							</>
						)}
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ScrollableChat;
