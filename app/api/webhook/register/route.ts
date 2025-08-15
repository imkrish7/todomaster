import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	console.log("krishna");
	const secret = process.env.WEBHOOK_SECRET;

	if (!secret) {
		throw new Error("Please add webhook secret in .env file");
	}

	const headerPayload = await headers();

	const svixId = headerPayload.get("svix-id");
	const svixTimestamp = headerPayload.get("svix-timestamp");
	const svixSignature = headerPayload.get("svix-signature");

	if (!svixId || !svixSignature || !svixSignature) {
		return new Response("Error occured- No Svix headers");
	}

	console.log("after headers extraction");

	const payload = await req.json();

	const body = JSON.stringify(payload);

	const wh = new Webhook(secret!);

	let evt: WebhookEvent;

	try {
		evt = wh.verify(body, {
			"svix-id": svixId,
			"svix-signature": svixSignature,
			"svix-timestamp": svixTimestamp!,
		}) as WebhookEvent;
	} catch (error) {
		console.error(JSON.stringify(error));
		return new Response("Error occured in webhook", { status: 400 });
	}

	const { id } = evt.data;
	const type = evt.type;

	console.log("Event id", id);

	if (type === "user.created") {
		try {
			const { email_addresses, primary_email_address_id } = evt.data;
			console.log(email_addresses);
			const primaryEmail = email_addresses.find(
				(e) => e.id === primary_email_address_id
			);
			console.log(primaryEmail);
			if (!primaryEmail) {
				return new Response("No primary email found", { status: 401 });
			}

			// create user in our db

			const newUser = await prisma.user.create({
				data: {
					email: primaryEmail.email_address,
					id: evt.data.id,
					isSubscribed: false,
				},
			});

			console.log(JSON.stringify(newUser));
		} catch (error) {
			console.error(error);
			return new Response("Error while saving user data in db", {
				status: 500,
			});
		}
	}

	return new Response("Wehbook recieved successfully!");
}
