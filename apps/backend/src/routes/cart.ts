import { Hono } from "hono";
import { DEFAULT_FINANCE_RATE, DEFAULT_LEASE_RATE } from "@/lib/constants";
import { getAccessoriesByIds } from "@/lib/dao/accessories";
import { getCarInventory } from "@/lib/dao/cars";
import type {
	Cart,
	FinanceCarCartItem,
	LeaseCarCartItem,
	RentCarCartItem,
} from "@/lib/types";
import {
	calcLeasePrice,
	calcLoanPayments,
	calcTotalCarPrice,
	calculateRent,
} from "@/lib/utils";

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

	const carIds = cart.items
		.filter((item) => item.itemType === "car")
		.map((item) => item.id);

	const accessoryIds = cart.items
		.filter((item) => item.itemType === "accessory")
		.map((item) => item.id);

	const [cars, accessories] = await Promise.all([
		carIds.length > 0
			? getCarInventory({ filters: { ids: carIds } })
			: Promise.resolve([]),
		accessoryIds.length > 0
			? getAccessoriesByIds(accessoryIds)
			: Promise.resolve([]),
	]);

	let total = 0;

	for (const item of cart.items) {
		if (item.itemType === "accessory") {
			const accessory = accessories.find((a) => a.id === item.id);
			if (accessory) {
				total += accessory.price * item.qty * 1.13;
			}

			continue;
		}

		const car = cars.find((c) => c.id === item.id);
		if (car) {
			const basePrice = calcTotalCarPrice(
				car.trim.price,
				car.trim.car.year,
				car.mileage,
			);
			if (item.orderType === "cash") {
				total += basePrice;
				continue;
			}

			if (item.orderType === "rent") {
				const typedItem = item as RentCarCartItem;
				const days = Math.ceil(
					(new Date(typedItem.endDate).getTime() -
						new Date(typedItem.startDate).getTime()) /
						(1000 * 60 * 60 * 24),
				);
				total +=
					calculateRent(car.trim.price, days, car.trim.car.estLifespanKM) *
					1.13;

				continue;
			}

			if (item.orderType === "finance") {
				const typedItem = item as FinanceCarCartItem;
				const loan = calcLoanPayments(
					basePrice,
					DEFAULT_FINANCE_RATE,
					typedItem.term / 12,
				);
				total += loan[typedItem.freq];
				continue;
			}

			const typedItem = item as LeaseCarCartItem;
			const leasePrice = calcLeasePrice(
				basePrice,
				typedItem.term,
				typedItem.annualKM,
				car.trim.car.estLifespanKM,
			);
			const loan = calcLoanPayments(
				leasePrice,
				DEFAULT_LEASE_RATE,
				typedItem.term / 12,
			);
			total += loan[typedItem.freq];
		}
	}

	return c.json({ total }, 200);
});

export default app;
