"use client";
import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";

import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

const SignupPage = () => {
	const { isLoaded, signUp, setActive } = useSignUp();
	const [emailAddress, setEmailAddress] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [pendingVerification, setPendingVerification] = useState(false);
	const [verificationCode, setVerificationCode] = useState<string>("");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [error, setError] = useState<any | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const router = useRouter();

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!isLoaded) {
			return;
		}

		try {
			await signUp.create({
				emailAddress: emailAddress,
				password: password,
			});

			await signUp.prepareEmailAddressVerification({
				strategy: "email_code",
			});

			setPendingVerification(true);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			setError(error.errors[0].message || "Something went wrong!");
		}
	}

	async function onVerification(e: React.FormEvent) {
		e.preventDefault();
		if (!isLoaded) {
			return;
		}

		try {
			const completeSignup = await signUp.attemptEmailAddressVerification(
				{
					code: verificationCode,
				}
			);

			if (completeSignup.status !== "complete") {
				setError("Please input a valid code!");
			}
			console.log(completeSignup.status);

			await setActive({ session: completeSignup.createdSessionId });
			router.push("/dashboard");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			setError(error.errors[0].message || "Verification failed!");
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						Sign Up for Todo Master
					</CardTitle>
				</CardHeader>
				<CardContent>
					{!pendingVerification ? (
						<form onSubmit={submit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									type="email"
									id="email"
									value={emailAddress}
									onChange={(e) =>
										setEmailAddress(e.target.value)
									}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Input
										type={
											showPassword ? "text" : "password"
										}
										id="password"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										required
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute right-2 top-1/2 -translate-y-1/2"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4 text-gray-500" />
										) : (
											<Eye className="h-4 w-4 text-gray-500" />
										)}
									</button>
								</div>
							</div>
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							<Button type="submit" className="w-full">
								Sign Up
							</Button>
						</form>
					) : (
						<form onSubmit={onVerification} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="code">Verification Code</Label>
								<Input
									id="code"
									value={verificationCode}
									onChange={(e) =>
										setVerificationCode(e.target.value)
									}
									placeholder="Enter verification code"
									required
								/>
							</div>
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							<Button type="submit" className="w-full">
								Verify Email
							</Button>
						</form>
					)}
				</CardContent>
				<CardFooter className="justify-center">
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/sign-in"
							className="font-medium text-primary hover:underline"
						>
							Sign in
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default SignupPage;
