import { eq, type SQL } from "drizzle-orm";
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

export async function getCarInventory(opts?: {
	filters?: {
		make?: number;
		color?: string;
		size?: string;
		carClass?: string;
		fuel?: string;
		xwd?: string;
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
		where: (fields, { or, eq, and, exists }) => {
			const base = or(fields.purchasable, fields.rentable);

			if (!opts?.filters) {
				return base;
			}

			let colorFilter: SQL<unknown> | undefined;
			if (opts.filters.color) {
				colorFilter = eq(fields.color, opts.filters.color);
			}

			const f = opts.filters;
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
