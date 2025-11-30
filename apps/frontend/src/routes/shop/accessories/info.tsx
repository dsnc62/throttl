import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shop/accessories/info")({
	component: ShopAccessoriesInfo,
});

function ShopAccessoriesInfo() {
	return <div>Hello "/shop/accessories/info"!</div>;
}
