import { createFileRoute, Link } from "@tanstack/react-router";
import { BoxesIcon, ShoppingCartIcon, UsersIcon } from "lucide-react";
import AdminWrapper from "@/components/admin/admin-wrapper";

export const Route = createFileRoute("/admin/")({
	component: Admin,
});

function Admin() {
	return (
		<AdminWrapper fullPath={Route.fullPath}>
			<h1 className="font-display font-semibold text-5xl">Admin Panel</h1>
			<div className="grid w-full max-w-3xl gap-4 md:grid-cols-3">
				<Link to="/admin/inventory">
					<div className="flex aspect-[3] flex-col items-start justify-between rounded-lg border bg-secondary p-4 font-medium md:aspect-video">
						<BoxesIcon />
						Inventory
					</div>
				</Link>
				<Link to="/admin/orders">
					<div className="flex aspect-[3] flex-col items-start justify-between rounded-lg border bg-secondary p-4 font-medium md:aspect-video">
						<ShoppingCartIcon />
						Orders
					</div>
				</Link>
				<Link to="/admin/users">
					<div className="flex aspect-[3] flex-col items-start justify-between rounded-lg border bg-secondary p-4 font-medium md:aspect-video">
						<UsersIcon />
						Users
					</div>
				</Link>
			</div>
		</AdminWrapper>
	);
}
