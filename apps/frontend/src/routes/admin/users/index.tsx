import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { columns } from "@/components/admin/users/columns";
import { DataTable } from "@/components/admin/users/data-table";
import AuthWall from "@/components/auth-wall";
import { authClient } from "@/lib/auth-client";
import type { FullUser } from "@/lib/types";

export const Route = createFileRoute("/admin/users/")({
	component: AdminUsers,
});

function AdminUsers() {
	const session = authClient.useSession();
	const navigate = useNavigate({ from: Route.fullPath });

	// queries
	const { data } = useQuery({
		queryFn: async () => {
			const res = await authClient.admin.listUsers({
				query: {},
			})

			if (res.error) {
				return []
			}

			return res.data.users as FullUser[];
		},
		queryKey: ["auth", "admin", "listUsers"],
	})

	// render
	if (!session.data) {
		return <AuthWall callbackURL={Route.fullPath} />;
	}

	if (session.data.user.role !== "admin") {
		navigate({ to: "/shop" });
		return null;
	}

	return (
		<>
			<h1 className="font-display font-semibold text-5xl">Manage Users</h1>
			<div className="container mx-auto">
				<DataTable columns={columns} data={data ?? []} />
			</div>
		</>
	)
}
