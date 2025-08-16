import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}
		return NextResponse.json({ data: user.isSubscribed }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(req: Request) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				isSubscribed: true,
				subscriptionEnds: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}
		const now = new Date();
		if (user.subscriptionEnds && user.subscriptionEnds < now) {
			await prisma.user.update({
				where: { id: userId },
				data: {
					isSubscribed: false,
					subscriptionEnds: null,
				},
			});

			return NextResponse.json(
				{
					data: {
						isSubscribed: false,
					},
				},
				{ status: 200 }
			);
		}
		return NextResponse.json(
			{ message: "Subscription completed" },
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
