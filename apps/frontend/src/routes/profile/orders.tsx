import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/orders")({
	component: ProfileOrders,
});

function ProfileOrders() {
	return <div>Hello "/profile/orders"!</div>;
}
