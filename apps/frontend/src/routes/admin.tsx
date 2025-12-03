import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminNav } from "@/components/admin/nav";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<AdminNav />
			<main className="container mx-auto flex flex-col gap-6 px-4 py-8">
				<Outlet />
			</main>
		</>
	);
}
