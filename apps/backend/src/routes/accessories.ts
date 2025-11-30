import { Hono } from "hono";
import {
	getAccessoryInventory,
	getAllAccessories,
} from "@/lib/dao/accessories";

const app = new Hono();

app.get("/", async (c) => {
	const { limit, offset } = c.req.query();
	const accessories = await getAllAccessories({
		limit: limit ? Number(limit) : undefined,
		offset: offset ? Number(offset) : undefined,
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

export default app;
