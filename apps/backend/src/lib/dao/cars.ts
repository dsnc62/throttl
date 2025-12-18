import { eq, ne, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
	car,
	carInventory,
	carOrder,
	carTrim,
	type ENUM_CLASS,
	type ENUM_FUEL,
	type ENUM_SIZE,
	type ENUM_XWD,
} from "../../db/schema/car.js";

export async function getAllCars() {
	const allCars = await db.query.car.findMany({
		with: { make: true, trims: true },
	});

	return allCars;
}

export async function getCarInventory(opts?: {
	filters?: {
		carClass?: string;
		color?: string;
		fuel?: string;
		ids?: string[];
		make?: number;
		size?: string;
		xwd?: string;
		rentable?: "true" | "false";
		purchasable?: "true" | "false";
		includeOrdered?: boolean;
		includeUnavailable?: boolean;
	};
	limit?: number;
	offset?: number;
	sort?: `${string}:${"asc" | "desc"}`;
}) {
	const inv = await db.query.carInventory.findMany({
		limit: opts?.limit ?? 50,
		offset: opts?.offset ?? 0,
		orderBy: (fields, { asc, desc }) => {
			if (!opts?.sort) {
				return fields.id;
			}

			const [key, dir] = opts.sort.split(":") as [string, "asc" | "desc"];
			switch (key) {
				case "fuelEcon": {
					const econ = db
						.select({ econ: carTrim.fuelEcon })
						.from(carTrim)
						.where(eq(carTrim.id, fields.trim));

					return [dir === "asc" ? asc(econ) : desc(econ), fields.id];
				}

				case "mileage":
					return [
						dir === "asc" ? asc(fields.mileage) : desc(fields.mileage),
						fields.id,
					];

				case "model": {
					const model = db
						.select({ model: car.model })
						.from(carTrim)
						.innerJoin(car, eq(carTrim.car, car.id))
						.where(eq(carTrim.id, fields.trim));

					const trim = db
						.select({ model: carTrim.name })
						.from(carTrim)
						.where(eq(carTrim.id, fields.trim));

					return [
						dir === "asc" ? asc(model) : desc(model),
						dir === "asc" ? asc(trim) : desc(trim),
						fields.id,
					];
				}

				case "price": {
					const price = db
						.select({ price: carTrim.price })
						.from(carTrim)
						.where(eq(carTrim.id, fields.trim));

					return [dir === "asc" ? asc(price) : desc(price), fields.id];
				}

				case "year": {
					const year = db
						.select({ year: car.year })
						.from(carTrim)
						.innerJoin(car, eq(carTrim.car, car.id))
						.where(eq(carTrim.id, fields.trim));

					return [dir === "asc" ? asc(year) : desc(year), fields.id];
				}

				default:
					return fields.id;
			}
		},
		where: (fields, { and, eq, exists, inArray, not, or }) => {
			const base = opts?.filters?.includeUnavailable
				? undefined
				: or(fields.purchasable, fields.rentable);

			let orderedFilter: SQL<unknown> | undefined;
			if (opts?.filters?.includeOrdered !== true) {
				orderedFilter = not(
					exists(
						db
							.select()
							.from(carOrder)
							.where(
								and(
									eq(carOrder.inventory, fields.id),
									ne(carOrder.status, "returned"),
								),
							),
					),
				);
			}

			let idFilter: SQL<unknown> | undefined;
			if (opts?.filters?.ids && opts.filters.ids.length > 0) {
				idFilter = inArray(fields.id, opts.filters?.ids);
			}

			let colorFilter: SQL<unknown> | undefined;
			if (opts?.filters?.color) {
				colorFilter = eq(fields.color, opts.filters.color);
			}

			let otherFilters: SQL<unknown> | undefined;
			if (opts?.filters) {
				const f = opts.filters;
				otherFilters = exists(
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
								f.carClass
									? eq(car.class, f.carClass as (typeof ENUM_CLASS)[number])
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
			}

			return and(
				base,
				orderedFilter,
				idFilter,
				colorFilter,
				otherFilters,
				opts?.filters?.purchasable === "false"
					? eq(fields.purchasable, false)
					: undefined,
				opts?.filters?.rentable === "false"
					? eq(fields.rentable, false)
					: undefined,
			);
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

export async function getCarFromInventory(
	id: string,
	opts?: {
		filters?: {
			includeOrdered?: boolean;
		};
	},
) {
	const car = await db.query.carInventory.findFirst({
		where: (fields, { eq, and, not, exists, ne }) => {
			const base = eq(fields.id, id);
			let orderedFilter: SQL<unknown> | undefined;
			if (!opts?.filters?.includeOrdered) {
				orderedFilter = not(
					exists(
						db
							.select()
							.from(carOrder)
							.where(
								and(
									eq(carOrder.inventory, fields.id),
									ne(carOrder.status, "returned"),
								),
							),
					),
				);
			}
			return and(base, orderedFilter);
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

	return car;
}

export async function getAllCarManufacturers() {
	const all = await db.query.carManufacturer.findMany({
		orderBy: (fields) => fields.name,
	});
	return all;
}

export async function updateCarInventory(
	id: string,
	updates: {
		mileage?: number;
		purchasable?: boolean;
		rentable?: boolean;
	},
) {
	// Validate mileage if provided
	if (updates.mileage !== undefined && updates.mileage < 0) {
		throw new Error("Mileage cannot be negative");
	}

	// Update the car inventory
	const result = await db
		.update(carInventory)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(eq(carInventory.id, id))
		.returning();

	if (result.length === 0) {
		throw new Error("Car inventory item not found");
	}

	return result[0];
}
