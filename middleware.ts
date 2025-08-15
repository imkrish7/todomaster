import {
	clerkMiddleware,
	clerkClient,
	createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoutes = createRouteMatcher([
	"/",
	"/api/webhook/register",
	"/sign-in",
	"/sign-up",
]);

export default clerkMiddleware(async (auth, req) => {
	try {
		const { userId } = await auth();
		console.log("middleware", userId);
		if (!userId && !isPublicRoutes(req)) {
			return NextResponse.redirect(new URL("/sign-in", req.url));
		}

		if (userId) {
			const user = (await clerkClient()).users.getUser(userId);
			const role = (await user).publicMetadata.role as string | undefined;

			if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
				return NextResponse.redirect(
					new URL("/admin/dashboard", req.url)
				);
			}

			if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
				return NextResponse.redirect(new URL("/dashboard", req.url));
			}

			if (isPublicRoutes(req)) {
				const url = new URL(
					role === "admin" ? "/admin/dashboard" : "/dashboard",
					req.url
				);
				return NextResponse.redirect(url);
			}
		}
	} catch (error) {
		console.error(error);
		return NextResponse.redirect(new URL("/404", req.url));
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
