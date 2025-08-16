import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;
const MAX_FREE_TODOS = 50;

export async function GET(req: NextRequest) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" });
	}

	const { searchParams } = new URL(req.url);

	const page = parseInt(searchParams.get("page") || "1");
	const search = searchParams.get("search") || "";

	try {
		const todos = await prisma.todo.findMany({
			where: {
				userId: userId,
				title: {
					contains: search,
					mode: "insensitive",
				},
			},
			orderBy: { createdAt: "desc" },
			take: ITEMS_PER_PAGE,
			skip: (page - 1) * ITEMS_PER_PAGE,
		});

		const countTodos = await prisma.todo.count({ where: { id: userId } });

		return NextResponse.json({
			data: todos,
			totalTodos: countTodos,
			currrentPage: page,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" });
	}

	try {
		const user = await prisma.user.findFirst({
			where: { id: userId },
			include: { todos: true },
		});
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		if (!user.isSubscribed && user.todos.length < MAX_FREE_TODOS) {
			return NextResponse.json(
				{
					error: "Your current subscription reached to maximum todo threshold",
				},
				{ status: 403 }
			);
		}

		const { title } = await req.json();

		const newTodo = await prisma.todo.create({
			data: {
				userId,
				title: title,
				completed: false,
			},
		});

		return NextResponse.json({ data: newTodo }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
