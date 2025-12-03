import { createFileRoute, Link } from "@tanstack/react-router";
import { BoxesIcon, CarIcon, ShoppingCartIcon, UsersIcon } from "lucide-react";
import AdminWrapper from "@/components/admin/admin-wrapper";

export const Route = createFileRoute("/admin/")({
	component: Admin,
});

function Admin() {
	return (
		<AdminWrapper fullPath={Route.fullPath}>
			<h1 className="font-display font-semibold text-5xl">Admin Panel</h1>
			<div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
				<Link to="/admin/cars">
					<div className="flex aspect-video flex-col items-start justify-between rounded-lg border bg-secondary p-4 font-medium">
						<CarIcon />
						Car Inventory
					</div>
				</Link>
				<Link to="/admin/accessories">
					<div className="flex aspect-video flex-col items-start justify-between rounded-lg border bg-secondary p-4 font-medium">
						<BoxesIcon />
						Accessory Inventory
					</div>
				</Link>
				<Link to="/admin/orders">
					<div className="flex aspect-video flex-col items-start justify-between rounded-lg border bg-secondary p-4 font-medium">
						<ShoppingCartIcon />
						Orders
					</div>
				</Link>
				<Link to="/admin/users">
					<div className="flex aspect-video flex-col items-start justify-between rounded-lg border bg-secondary p-4 font-medium">
						<UsersIcon />
						Users
					</div>
				</Link>
			</div>
		</AdminWrapper>
	);
}
