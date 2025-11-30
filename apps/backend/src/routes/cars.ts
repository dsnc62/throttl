import { Hono } from "hono";
import { getAllCars, getCarInventory } from "@/lib/dao/cars";

const app = new Hono();

app.get("/", async (c) => {
	const cars = await getAllCars();
	return c.json(cars, 200);
});

app.get("/inventory", async (c) => {
	const { limit, offset } = c.req.query();
	const cars = await getCarInventory({
		limit: limit ? Number(limit) : undefined,
		offset: offset ? Number(offset) : undefined,
	});
	return c.json(cars, 200);
});

export default app;
