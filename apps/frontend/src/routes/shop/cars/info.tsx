import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shop/cars/info")({
	component: ShopCarsInfo,
});

function ShopCarsInfo() {
	return <div>Hello "/cars/info"!</div>;
}
