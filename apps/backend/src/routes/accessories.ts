import { Hono } from "hono";
import {
	getAccessoryCars,
	getAccessoryInventory,
	getAccessoryManufacturers,
	getAllAccessories,
} from "@/lib/dao/accessories";

const app = new Hono();

app.get("/", async (c) => {
	const { limit, offset, sort, ...filters } = c.req.query();

	const accessories = await getAllAccessories({
		filters,
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

export default app;
