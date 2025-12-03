import { useNavigate } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { authClient } from "@/lib/auth-client";
import AuthWall from "../auth-wall";

export default function AdminWrapper(
	props: PropsWithChildren<{ fullPath: string }>,
) {
	const session = authClient.useSession();
	const navigate = useNavigate();

	if (!session.data) {
		return <AuthWall callbackURL={props.fullPath} />;
	}

	if (session.data.user.role !== "admin") {
		navigate({ to: "/shop" });
		return null;
	}

	return props.children;
}
