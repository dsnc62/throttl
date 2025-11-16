import { createFileRoute } from "@tanstack/react-router";
import { ShopNav } from "@/components/shop/nav";

export const Route = createFileRoute("/shop/")({
	component: Shop,
});

function Shop() {
	return (
		<>
			<ShopNav />
			<main className="p-4">
				<div>Hello "/shop/"!</div>
			</main>
		</>
	);
}
