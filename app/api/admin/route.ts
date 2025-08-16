import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function isAdmin(userId: string) {
	const user = await (await clerkClient()).users.getUser(userId);

	return user.privateMetadata.role === "admin";
}
