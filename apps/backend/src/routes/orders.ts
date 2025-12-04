import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/db";
import { carOrder } from "@/db/schema/car";
import { auth } from "@/lib/auth";
import {
	createAccessoryOrder,
	createCarOrder,
	createTransaction,
	getCarPurchaseDetails,
} from "@/lib/dao/orders";
import {
	getAllTransactions,
	getTransaction,
	getUserTransactions,
} from "@/lib/dao/transactions";
import type { Cart, OrderDetails } from "@/lib/types";

const app = new Hono();

const VALID_CARD_NUMBERS = [
	"4242",
	"4505",
	"4506",
	"4510",
	"4512",
	"4514",
	"4519",
	"4520",
	"4523",
	"4526",
	"4530",
	"4535",
];

app.post("/", async (c) => {
	const { cart, details }: { cart: Cart; details: Omit<OrderDetails, "user"> } =
		await c.req.json();

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	if (!session) {
		return c.json({ success: false }, 401);
	}

	if (!VALID_CARD_NUMBERS.includes(details.cardNumber.slice(0, 4))) {
		return c.text("Credit Card Authorization Failed", 400);
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

	return c.json({ id: txID as string });
});

app.get("transactions/:id", async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	if (!session) {
		return c.json({ success: false }, 401);
	}

	const { id } = c.req.param();

	if (session.user.id !== id && session.user.role !== "admin") {
		return c.json({ success: false }, 403);
	}

	const tx = await getTransaction(id);
	return c.json(tx);
});

app.get("/users/:id/transactions", async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	if (!session) {
		return c.json({ success: false }, 401);
	}

	const { id } = c.req.param();

	if (session.user.id !== id && session.user.role !== "admin") {
		return c.json({ success: false }, 403);
	}

	const transactions = await getUserTransactions(id);
	return c.json(transactions);
});

app.get("/cars/:id/details", async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({ success: false }, 401);
	}

	const { id } = c.req.param();

	// Check ownership by querying the car order's transaction user
	const order = await db.query.carOrder.findFirst({
		where: eq(carOrder.id, id),
		with: { tx: true },
	});

	if (!order) {
		return c.json(null); // Order doesn't exist
	}

	if (session.user.id !== order.tx.user && session.user.role !== "admin") {
		return c.json({ success: false }, 403);
	}

	const details = await getCarPurchaseDetails(id);
	return c.json(details);
});

app.get("/transactions", async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({ success: false }, 401);
	}

	if (session.user.role !== "admin") {
		return c.json({ success: false }, 403);
	}

	const transactions = await getAllTransactions();
	return c.json(transactions);
});

export default app;
