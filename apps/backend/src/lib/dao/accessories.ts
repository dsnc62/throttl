import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
	accessory,
	accessoryCarXref,
	accessoryInventory,
	accessoryOrder,
	type ENUM_CAT,
} from "@/db/schema/accessory";

export async function getAllAccessories(opts?: {
	filters?: {
		car?: number;
		category?: string;
		make?: string;
		include0Qty: "true" | "false";
	};
	sort?: `${string}:${"asc" | "desc"}`;
	limit?: number;
	offset?: number;
}) {
	const allAccessories = await db.query.accessory.findMany({
		limit: opts?.limit ?? 50,
		offset: opts?.offset ?? 0,
		orderBy: (fields, { asc, desc }) => {
			if (!opts?.sort) {
				return fields.id;
			}

			const [key, dir] = opts.sort.split(":") as [string, "asc" | "desc"];
			switch (key) {
				case "name": {
					return [
						dir === "asc" ? asc(fields.name) : desc(fields.name),
						dir === "asc" ? asc(fields.make) : desc(fields.make),
						fields.id,
					];
				}

				case "price": {
					return [
						dir === "asc" ? asc(fields.price) : desc(fields.price),
						fields.id,
					];
				}

				default:
					return fields.id;
			}
		},
		where: (fields, { and, eq, exists, or }) => {
			if (!opts?.filters) {
				return undefined;
			}

			const f = opts.filters;
			const conditions: (SQL<unknown> | undefined)[] = [];

			if (f.car) {
				conditions.push(
					or(
						eq(fields.universal, true),
						exists(
							db
								.select()
								.from(accessoryCarXref)
								.where(
									and(
										eq(accessoryCarXref.accessory, fields.id),
										eq(accessoryCarXref.car, f.car),
									),
								),
						),
					),
				);
			}

			if (f.category) {
				conditions.push(
					eq(
						fields.category,
						opts.filters.category as (typeof ENUM_CAT)[number],
					),
				);
			}

			if (f.make) {
				conditions.push(eq(fields.make, f.make));
			}

			return and(...conditions);
		},
		with: {
			inventories: {
				where: (fields, { and, eq, sql }) =>
					and(
						eq(fields.discarded, false),
						opts?.filters?.include0Qty
							? undefined
							: sql`NOT EXISTS (SELECT 1 FROM accessory_order WHERE accessory_order.inventory = ${fields.id} AND accessory_order.status != 'returned')`,
					),
			},
		},
	});

	return allAccessories;
}

export async function getAccessoryInventory(opts?: {
	filters?: {
		make?: string;
	};
	limit?: number;
	offset?: number;
}) {
	const inv = await db.query.accessoryInventory.findMany({
		limit: opts?.limit ?? 50,
		offset: opts?.offset ?? 0,
		where: (fields, { eq, and, exists }) => {
			if (!opts?.filters) {
				return undefined;
			}

			const f = opts.filters;
			const otherFilters = exists(
				db
					.select()
					.from(accessory)
					.where(
						and(
							eq(accessory.id, fields.accessory),

							// make filter
							f.make ? eq(accessory.make, f.make) : undefined,
						),
					),
			);

			return and(otherFilters);
		},
		with: {
			accessory: true,
		},
	});

	return inv;
}

export async function getAccessoryManufacturers() {
	const makes = await db.query.accessory.findMany({ columns: { make: true } });
	const unique = new Set(makes.map((m) => m.make));
	return Array.from(unique).toSorted();
}

export async function getAccessoryById(id: number) {
	const acc = await db.query.accessory.findFirst({
		where: (fields, { eq }) => eq(fields.id, id),
		with: {
			inventories: {
				where: (fields, { sql }) =>
					sql`NOT EXISTS (SELECT 1 FROM accessory_order WHERE accessory_order.inventory = ${fields.id} AND accessory_order.status != 'returned')`,
			},
		},
	});

	return acc;
}

export async function getAccessoryCars() {
	const xrefs = await db.query.accessoryCarXref.findMany({
		with: {
			car: {
				columns: { id: true, model: true },
				with: {
					make: {
						columns: { name: true },
					},
				},
			},
		},
	});

	const res: { [make: string]: { id: number; model: string }[] } = {};
	for (const {
		car: { id, model, make },
	} of xrefs) {
		if (!Object.hasOwn(res, make.name)) {
			res[make.name] = [{ id, model }];
			continue;
		}

		if (res[make.name].some((x) => x.id === id)) {
			continue;
		}

		res[make.name].push({ id, model });
	}

	for (const k of Object.keys(res)) {
		res[k] = res[k].sort((a, b) => a.model.localeCompare(b.model));
	}

	return res;
}

export async function getAccessoryCarById(id: number) {
	const xref = await db.query.accessoryCarXref.findFirst({
		where: (fields, { eq }) => eq(fields.accessory, id),
		with: {
			car: {
				columns: { id: true, model: true },
				with: {
					make: {
						columns: { name: true },
					},
				},
			},
		},
	});

	return xref;
}

export async function getAccessoriesByIds(ids: number[]) {
	const accessories = await db.query.accessory.findMany({
		where: (fields, { inArray }) => inArray(fields.id, ids),
		with: {
			inventories: {
				where: (fields, { sql }) =>
					sql`NOT EXISTS (SELECT 1 FROM accessory_order WHERE accessory_order.inventory = ${fields.id} AND accessory_order.status != 'returned')`,
			},
		},
	});

	return accessories;
}

export async function updateAccessory(id: number, updates: { price: number }) {
	// Validate price
	if (updates.price <= 0) {
		throw new Error("Price must be positive");
	}

	// Update the accessory
	const result = await db
		.update(accessory)
		.set({
			price: updates.price,
		})
		.where(eq(accessory.id, id))
		.returning();

	if (result.length === 0) {
		throw new Error("Accessory not found");
	}

	return result[0];
}

export async function createAccessoryInventory(accessoryId: number) {
	// Check if accessory exists
	const existingAccessory = await db.query.accessory.findFirst({
		where: eq(accessory.id, accessoryId),
	});

	if (!existingAccessory) {
		throw new Error("Accessory not found");
	}

	// Create new inventory item
	const inventoryId = crypto.randomUUID();
	const result = await db
		.insert(accessoryInventory)
		.values({
			accessory: accessoryId,
			discarded: false,
			id: inventoryId,
		})
		.returning();

	return result[0];
}

export async function removeAccessoryInventory(inventoryId: string) {
	// check if inventory exists and get related orders
	const inventory = await db.query.accessoryInventory.findFirst({
		where: eq(accessoryInventory.id, inventoryId),
	});

	if (!inventory) {
		return;
	}

	// check for orders with this inventory
	const orders = await db.query.accessoryOrder.findMany({
		where: eq(accessoryOrder.inventory, inventoryId),
	});

	// check if any orders are purchased (cannot remove)
	const hasPurchasedOrders = orders.some(
		(order) => order.status === "purchased",
	);
	if (hasPurchasedOrders) {
		return;
	}

	// check if any orders are returned (mark as discarded)
	const hasReturnedOrders = orders.some((order) => order.status === "returned");
	if (hasReturnedOrders) {
		await db
			.update(accessoryInventory)
			.set({ discarded: true })
			.where(eq(accessoryInventory.id, inventoryId));

		return { action: "discarded", inventoryId };
	}

	await db
		.delete(accessoryInventory)
		.where(eq(accessoryInventory.id, inventoryId));

	return { action: "removed", inventoryId };
}
