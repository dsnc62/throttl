import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ShopNav } from "@/components/shop/nav";

export const Route = createFileRoute("/shop")({
	component: ShopLayout,
});

function ShopLayout() {
	return (
		<>
			<ShopNav />
			<main className="container mx-auto flex flex-col gap-6 px-4 py-8">
				<Outlet />
			</main>
		</>
	);
}
