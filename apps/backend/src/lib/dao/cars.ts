import { db } from "@/db";

export async function getAllCars() {
	const allCars = await db.query.car.findMany({
		with: { make: true, trims: true },
	});

	return allCars;
}

export async function getCarInventory(options?: {
	limit?: number;
	offset?: number;
}) {
	const inv = await db.query.carInventory.findMany({
		limit: options?.limit ?? 50,
		offset: options?.offset ?? 0,
		where: (fields, { or }) => or(fields.purchasable, fields.rentable),
		with: {
			trim: {
				with: {
					car: {
						with: {
							make: true,
						},
					},
				},
			},
		},
	});

	return inv;
}
