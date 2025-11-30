import { db } from "@/db";

export async function getAllAccessories(options?: {
	limit?: number;
	offset?: number;
}) {
	const allAccessories = await db.query.accessory.findMany({
		limit: options?.limit ?? 50,
		offset: options?.offset ?? 0,
		with: {
			inventories: {
				where: (fields, { sql }) =>
					sql`NOT EXISTS (SELECT 1 FROM accessory_order WHERE accessory_order.inventory = ${fields.id} AND accessory_order.status != 'returned')`,
			},
		},
	});

	return allAccessories;
}

export async function getAccessoryInventory(options?: {
	limit?: number;
	offset?: number;
}) {
	const inv = await db.query.accessoryInventory.findMany({
		limit: options?.limit ?? 50,
		offset: options?.offset ?? 0,
		with: {
			accessory: true,
		},
	});

	return inv;
}
