import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import AdminWrapper from "@/components/admin/admin-wrapper";
import { columns } from "@/components/admin/users/columns";
import { DataTable } from "@/components/admin/users/data-table";
import { authClient } from "@/lib/auth-client";
import type { FullUser } from "@/lib/types";

export const Route = createFileRoute("/admin/users/")({
	component: AdminUsers,
});

function AdminUsers() {
	// queries
	const { data } = useQuery({
		queryFn: async () => {
			const res = await authClient.admin.listUsers({
				query: {},
			});

			if (res.error) {
				return [];
			}

			return res.data.users as FullUser[];
		},
		queryKey: ["auth", "admin", "listUsers"],
	});

	return (
		<AdminWrapper fullPath={Route.fullPath}>
			<h1 className="font-display font-semibold text-5xl">Manage Users</h1>
			<div className="container mx-auto">
				<DataTable columns={columns} data={data ?? []} />
			</div>
		</AdminWrapper>
	);
}
