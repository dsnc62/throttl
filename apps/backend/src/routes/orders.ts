import { Hono } from "hono";
import { auth } from "@/lib/auth";
import {
	createAccessoryOrder,
	createCarOrder,
	createTransaction,
} from "@/lib/dao/orders";
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

	const txID = crypto.randomUUID();
	await createTransaction(txID, cart, { ...details, user: session.user.id });

	for (const item of cart.items) {
		if (item.itemType === "accessory") {
			await createAccessoryOrder(txID, item);
			continue;
		}

		await createCarOrder(txID, item);
	}

	return c.json({ success: true });
});

export default app;
