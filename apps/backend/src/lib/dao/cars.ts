import type { SQL } from "drizzle-orm";
import { db } from "@/db";
import {
	car,
	carTrim,
	type ENUM_CLASS,
	type ENUM_FUEL,
	type ENUM_SIZE,
	type ENUM_XWD,
} from "@/db/schema/car";

export async function getAllCars() {
	const allCars = await db.query.car.findMany({
		with: { make: true, trims: true },
	});

	return allCars;
}

export async function getCarInventory(options?: {
	filters?: {
		make?: number;
		color?: string;
		size?: string;
		class?: string;
		fuel?: string;
		xwd?: string;
	};
	limit?: number;
	offset?: number;
}) {
	const inv = await db.query.carInventory.findMany({
		limit: options?.limit ?? 50,
		offset: options?.offset ?? 0,
		where: (fields, { or, eq, and, exists }) => {
			const base = or(fields.purchasable, fields.rentable);

			if (!options?.filters) {
				return base;
			}

			let colorFilter: SQL<unknown> | undefined;
			if (options.filters.color) {
				colorFilter = eq(fields.color, options.filters.color);
			}

			const f = options.filters;
			const otherFilters = exists(
				db
					.select()
					.from(carTrim)
					.innerJoin(car, eq(car.id, carTrim.car))
					.where(
						and(
							eq(carTrim.id, fields.trim),

							// fuel filter
							f.fuel
								? eq(carTrim.fuel, f.fuel as (typeof ENUM_FUEL)[number])
								: undefined,

							// xwd filter
							f.xwd
								? eq(carTrim.xwd, f.xwd as (typeof ENUM_XWD)[number])
								: undefined,

							// class filter
							f.class
								? eq(car.class, f.class as (typeof ENUM_CLASS)[number])
								: undefined,

							// make filter
							f.make ? eq(car.make, f.make) : undefined,

							// size filter
							f.size
								? eq(car.size, f.size as (typeof ENUM_SIZE)[number])
								: undefined,
						),
					),
			);

			return and(base, colorFilter, otherFilters);
		},
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

export async function getAllCarManufacturers() {
	const all = await db.query.carManufacturer.findMany({
		orderBy: (fields) => fields.name,
	});
	return all;
}
