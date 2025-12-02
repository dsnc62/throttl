import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { createAccessoryOrder, createCarOrder } from "@/lib/dao/orders";
import type { Cart, OrderDetails } from "@/lib/types";

const app = new Hono();

app.post("/", async (c) => {
	const { cart, details }: { cart: Cart; details: Omit<OrderDetails, "user"> } =
		await c.req.json();

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	if (!session) {
		return c.json({ success: false }, 401);
	}

	for (const item of cart.items) {
		if (item.itemType === "accessory") {
			await createAccessoryOrder(item, { ...details, user: session.user.id });
			continue;
		}

		await createCarOrder(item, { ...details, user: session.user.id });
	}

	return c.json({ success: true });
});

export default app;
