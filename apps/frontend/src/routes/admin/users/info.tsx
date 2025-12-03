import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const adminUsersInfoSearchSchema = z.object({
	id: z.string(),
});

export const Route = createFileRoute("/admin/users/info")({
	component: AdminUsersInfo,
	validateSearch: adminUsersInfoSearchSchema,
});

function AdminUsersInfo() {
	const { id } = Route.useSearch();

	return <div>Hello "/admin/users/info"!</div>;
}
