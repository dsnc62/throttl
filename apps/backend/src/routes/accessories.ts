import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
	createAccessoryInventory,
	getAccessoryById,
	getAccessoryCarById,
	getAccessoryCars,
	getAccessoryInventory,
	getAccessoryManufacturers,
	getAllAccessories,
	removeAccessoryInventory,
	updateAccessory,
} from "@/lib/dao/accessories";

const app = new Hono();

app.get("/", async (c) => {
	const { limit, offset, sort, ...filters } = c.req.query();

	const accessories = await getAllAccessories({
		filters: {
			...filters,
			include0Qty: (filters.include0Qty as "true" | "false") ?? "false",
		},
		limit: limit ? Number(limit) : undefined,
		offset: offset ? Number(offset) : undefined,
		sort: sort as `${string}:${"asc" | "desc"}`,
	});

	return c.json(accessories, 200);
});

app.get("/inventory", async (c) => {
	const { limit, offset } = c.req.query();
	const accessories = await getAccessoryInventory({
		limit: limit ? Number(limit) : undefined,
		offset: offset ? Number(offset) : undefined,
	});
	return c.json(accessories, 200);
});

app.get("/manufacturers", async (c) => {
	const makes = await getAccessoryManufacturers();
	return c.json(makes, 200);
});

app.get("/cars", async (c) => {
	const cars = await getAccessoryCars();
	return c.json(cars, 200);
});

app.get("/:id", async (c) => {
	const id = Number(c.req.param("id"));

	const accessory = await getAccessoryById(id);
	if (!accessory) {
		return c.notFound();
	}

	return c.json(accessory, 200);
});

app.get("/cars/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const car = await getAccessoryCarById(id);
	if (!car) {
		return c.notFound();
	}

	return c.json(car, 200);
});

const updateAccessorySchema = z.object({
	price: z.number().min(1),
	qty: z.number().int().min(0),
});

app.patch("/:id", zValidator("json", updateAccessorySchema), async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	if (session.user.role !== "admin") {
		return c.json({ error: "Admin access required" }, 403);
	}

	const id = Number(c.req.param("id"));
	const { price, qty } = c.req.valid("json");

	// update accessory price
	await updateAccessory(id, { price });

	// check quantity
	const accessory = await getAccessoryById(id);
	if (!accessory) {
		return c.json({ error: "Accessory not found" }, 404);
	}

	const currentQty = accessory.inventories.length;
	const difference = qty - currentQty;

	if (difference > 0) {
		// create items
		for (let i = 0; i < difference; i++) {
			await createAccessoryInventory(id);
		}
	} else if (difference < 0) {
		// remove items
		const availableInventory = accessory.inventories.filter(
			(inv) => !inv.discarded,
		);

		const toRemove = Math.abs(difference);
		if (availableInventory.length < toRemove) {
			return c.text("Insufficient removable inventory", 400);
		}

		for (let i = 0; i < toRemove; i++) {
			await removeAccessoryInventory(availableInventory[i].id);
		}
	}

	// Return updated accessory with fresh inventory data
	const updatedAccessory = await getAccessoryById(id);
	return c.json(updatedAccessory, 200);
});

export default app;
