import { Hono } from "hono";
import { getAccessoriesByIds } from "@/lib/dao/accessories";
import { getCarInventory } from "@/lib/dao/cars";
import type { Cart } from "@/lib/types";
import { calcCartTotal } from "@/lib/utils";

const app = new Hono();

app.get("/details", async (c) => {
	const ids = c.req.query("ids");
	if (!ids) {
		return c.json({ error: "ids query parameter is required" }, 400);
	}

	const carIds = ids.split(",").filter((id) => id.trim().length > 0);
	if (carIds.length === 0) {
		return c.json({ error: "at least one valid id is required" }, 400);
	}

	const cars = await getCarInventory({ filters: { ids: carIds } });
	return c.json(cars, 200);
});

app.get("/accessories", async (c) => {
	const ids = c.req.query("ids");
	if (!ids) {
		return c.json({ error: "ids query parameter is required" }, 400);
	}

	const accessoryIds = ids
		.split(",")
		.map((id) => Number(id.trim()))
		.filter((id) => !Number.isNaN(id));

	if (accessoryIds.length === 0) {
		return c.json({ error: "at least one valid id is required" }, 400);
	}

	const accessories = await getAccessoriesByIds(accessoryIds);
	return c.json(accessories, 200);
});

app.post("/total", async (c) => {
	const cart = await c.req.json<Cart>();
	if (!cart || !cart.items || !Array.isArray(cart.items)) {
		return c.json({ error: "Invalid cart data" }, 400);
	}

	const total = await calcCartTotal(cart);

	return c.json({ total }, 200);
});

export default app;
