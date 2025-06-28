import {
	Button,
	IconButton,
	Modal,
	ModalOverlay,
	ModalFooter,
	ModalCloseButton,
	ModalContent,
	ModalBody,
	ModalHeader,
} from "@chakra-ui/icons";
import { Image, Text } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/hooks";
import { ViewIcon } from "@chakra-ui/icons";
import React from "react";

const ProfileModal = ({ user, children }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<>
			{children ? (
				<span onClick={onOpen}>{children}</span>
			) : (
				<IconButton
					d={{ base: "flex" }}
					icon={<ViewIcon />}
					onClick={onOpen}
				/>
			)}
			<Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay />
				<ModalContent h="410px">
					<ModalHeader
						fontSize="40px"
						fontFamily="Work Sans"
						display="flex"
						justifyContent="center"
						fontStyle="normal"
						fontWeight={300}
					>
						{user.name}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody
						display="flex"
						flexDir="column"
						alignItems="center"
						justifyContent="space-between"
					>
						<Image
							borderRadius="full"
							boxSize="150px"
							src={user.pic}
							alt={user.name}
						/>
						<Text
							fontSize={{ base: "28px", md: "30px" }}
							fontFamily="Work Sans"
							fontStyle="normal"
							fontWeight={300}
						>
							Email: {user.email}
						</Text>
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" mr={3} onClick={onClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ProfileModal;
