import { FormControl, FormLabel, Button } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import React, { useState } from "react";

const Signup = () => {
	const [show, setShow] = useState(false);
	const [name, setName] = useState();
	const [email, setEmail] = useState();
	const [confirmPassword, setConfirmpassword] = useState();
	const [password, setPassword] = useState();
	const [pic, setPic] = useState();
	const [loading, setLoading] = useState();
	const toast = useToast();
	const history = useHistory();

	const handleClick = () => setShow(!show);

	const postDetails = (pics) => {
		setLoading(true);
		if (pics === undefined) {
			toast({
				title: "Please Select an Image!",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		if (pics.type === "image/jpeg" || pics.type === "image/png") {
			const data = new FormData();
			data.append("file", pics);
			data.append("upload_preset", "Jeff-Chat");
			data.append("cloud_name", "dhwmksior");
			fetch("https://api.cloudinary.com/v1_1/dhwmksior/image/upload", {
				method: "post",
				body: data,
			})
				.then((res) => res.json())
				.then((data) => {
					setPic(data.url.toString());
					setLoading(false);
					console.log(data.url.toString());
				})
				.catch((err) => {
					console.log(err);
					setLoading(false);
				});
		} else {
			toast({
				title: "Please Select an Image!",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}
	};

	const submitHandler = async () => {
		console.log("submit handler running");
		setLoading(true);
		if (!name || !email || !password || !confirmPassword) {
			toast({
				title: "Please fill all the fields",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			toast({
				title: "Passwords don't match!",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		try {
			console.log("trying...");
			const config = {
				headers: {
					"Content-type": "application/json",
				},
			};

			const { data } = await axios.post(
				"/api/user",
				{ name, email, password, pic },
				config
			);

			console.log("Success!");
			toast({
				title: "Registration Successful!",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});

			localStorage.setItem("userInfo", JSON.stringify(data));

			setLoading(false);
			history.push("/chats");
		} catch (error) {
			console.log("ERROR! No longer trying.");
			toast({
				title: "Error Occured!",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault(); // <--- FIXED: Prevent default form submission!
				submitHandler();
			}}
			style={{ width: "100%" }}
		>
			<VStack spacing="5px" color="black">
				<FormControl id="first-name" isRequired>
					<FormLabel>Name</FormLabel>
					<Input
						placeholder="Name Here!"
						onChange={(e) => setName(e.target.value)}
					/>
				</FormControl>

				<FormControl id="email" isRequired>
					<FormLabel>Email</FormLabel>
					<Input
						placeholder="Email Here!"
						onChange={(e) => setEmail(e.target.value)}
					/>
				</FormControl>

				<FormControl id="password" isRequired>
					<FormLabel>Password</FormLabel>
					<InputGroup>
						<Input
							type={show ? "text" : "password"}
							placeholder="Password Here!"
							onChange={(e) => setPassword(e.target.value)}
						/>
						<InputRightElement width="4.5rem">
							<Button h="1.75rem" size="sm" onClick={handleClick}>
								{show ? "Hide" : "Show"}
							</Button>
						</InputRightElement>
					</InputGroup>
				</FormControl>

				<FormControl id="password" isRequired>
					<FormLabel>Confirm Password</FormLabel>
					<InputGroup>
						<Input
							type={show ? "text" : "password"}
							placeholder="Password Here!"
							onChange={(e) => setConfirmpassword(e.target.value)}
						/>
						<InputRightElement width="4.5rem">
							<Button h="1.75rem" size="sm" onClick={handleClick}>
								{show ? "Hide" : "Show"}
							</Button>
						</InputRightElement>
					</InputGroup>
				</FormControl>

				<FormControl id="pic" isRequired>
					<FormLabel>Upload Your Picture</FormLabel>
					<Input
						type="file"
						p={1.5}
						accept="image/*"
						onChange={(e) => postDetails(e.target.files[0])}
					/>
				</FormControl>

				<Button
					colorScheme="blue"
					width="100%"
					style={{ marginTop: 15 }}
					onClick={submitHandler}
					isLoading={loading}
				>
					🚀Sign Up🚀
				</Button>
			</VStack>
		</form>
	);
};

export default Signup;
