import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" });
	}

	const { id } = await params;

	try {
		const todo = await prisma.todo.findFirst({
			where: { id, userId },
		});

		if (!todo) {
			return NextResponse.json(
				{ error: "No todo found" },
				{ status: 404 }
			);
		}

		const deletedTodo = await prisma.todo.delete({
			where: {
				id,
				userId,
			},
		});

		return NextResponse.json(
			{ message: `Todo with ${deletedTodo.id} has been deleted` },
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

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" });
	}

	const { id } = await params;

	try {
		const todo = await prisma.todo.findFirst({
			where: { id, userId },
		});

		const { completed, title } = await req.json();

		if (!todo) {
			return NextResponse.json(
				{ error: "No todo found" },
				{ status: 404 }
			);
		}

		const updatedTodo = await prisma.todo.update({
			where: {
				id,
				userId,
			},
			data: {
				completed: completed ?? todo.completed,
				title: title ?? todo.title,
			},
		});

		return NextResponse.json(
			{ message: `Todo with ${updatedTodo} has been updated` },
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
