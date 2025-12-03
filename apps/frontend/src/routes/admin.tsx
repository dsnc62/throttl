import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminNav } from "@/components/admin/nav";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<AdminNav />
			<main className="flex flex-col gap-6 p-8">
				<Outlet />
			</main>
		</>
	);
}
