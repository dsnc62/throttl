import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { auth } from "@/lib/auth";
import {
	getAllCarManufacturers,
	getAllCars,
	getCarFromInventory,
	getCarInventory,
	updateCarInventory,
} from "@/lib/dao/cars";

const app = new Hono();

app.get("/", async (c) => {
	const cars = await getAllCars();
	return c.json(cars, 200);
});

app.get("/inventory", async (c) => {
	const { limit, offset, make, sort, ...otherFilters } = c.req.query();
	const cars = await getCarInventory({
		filters: {
			...otherFilters,
			make: make ? Number(make) : undefined,
		},
		limit: limit ? Number(limit) : undefined,
		offset: offset ? Number(offset) : undefined,
		sort: (sort as `${string}:${"asc" | "desc"}`) || undefined,
	});
	return c.json(cars, 200);
});

app.get("/inventory/:id", async (c) => {
	const id = c.req.param("id");
	const car = await getCarFromInventory(id);
	if (!car) {
		return c.notFound();
	}

	return c.json(car, 200);
});

app.get("/manufacturers", async (c) => {
	const makes = await getAllCarManufacturers();
	return c.json(makes, 200);
});

const patchCarInvSchema = z.object({
	mileage: z.number(),
	purchasable: z.boolean(),
	rentable: z.boolean(),
});
app.patch(
	"/inventory/:id",
	zValidator("json", patchCarInvSchema),
	async (c) => {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});
		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		if (session.user.role !== "admin") {
			return c.json({ error: "Admin access required" }, 403);
		}

		const id = c.req.param("id");
		const body = c.req.valid("json");

		const existing = await getCarFromInventory(id, {
			filters: { includeOrdered: true },
		});
		if (!existing || existing?.mileage > body.mileage) {
			return c.text("no", 400);
		}

		const updatedInventory = await updateCarInventory(id, body);
		return c.json(updatedInventory, 200);
	},
);

export default app;
