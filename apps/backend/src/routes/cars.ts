import { Hono } from "hono";
import {
	getAllCarManufacturers,
	getAllCars,
	getCarInventory,
} from "@/lib/dao/cars";

const app = new Hono();

app.get("/", async (c) => {
	const cars = await getAllCars();
	return c.json(cars, 200);
});

app.get("/inventory", async (c) => {
	const { limit, offset, carClass, make, sort, ...otherFilters } =
		c.req.query();
	const cars = await getCarInventory({
		filters: {
			...otherFilters,
			class: carClass || undefined,
			make: make ? Number(make) : undefined,
		},
		limit: limit ? Number(limit) : undefined,
		offset: offset ? Number(offset) : undefined,
		sort: (sort as `${string}:${"asc" | "desc"}`) || undefined,
	});
	return c.json(cars, 200);
});

app.get("/manufacturers", async (c) => {
	const makes = await getAllCarManufacturers();
	return c.json(makes, 200);
});

export default app;
