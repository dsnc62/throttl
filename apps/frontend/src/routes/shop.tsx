import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ShopNav } from "@/components/shop/nav";

export const Route = createFileRoute("/shop")({
	component: ShopLayout,
});

function ShopLayout() {
	return (
		<>
			<ShopNav />
			<main className="flex flex-col gap-6 p-8">
				<Outlet />
			</main>
		</>
	);
}
