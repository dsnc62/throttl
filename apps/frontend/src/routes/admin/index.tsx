import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BoxesIcon, ShoppingCartIcon, UsersIcon } from "lucide-react";
import AuthWall from "@/components/auth-wall";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin/")({
	component: Admin,
});

function Admin() {
	const session = authClient.useSession();
	const navigate = useNavigate({ from: Route.fullPath });

	if (!session.data) {
		return <AuthWall callbackURL={Route.fullPath} />;
	}

	if (session.data.user.role !== "admin") {
		navigate({ to: "/shop" });
		return null;
	}

	return (
		<>
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
		</>
	);
}
