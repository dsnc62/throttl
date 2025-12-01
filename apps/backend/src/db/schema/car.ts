import { relations, sql } from "drizzle-orm";
import {
	integer,
	real,
	sqliteTable,
	text,
	unique,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const ENUM_CLASS = [
	"hatchback",
	"minivan",
	"sedan",
	"sports-car",
	"suv",
	"truck",
] as const;

export const ENUM_COUNTRIES = [
	"america",
	"china",
	"germany",
	"japan",
	"sweden",
	"south-korea",
] as const;

export const ENUM_FUEL = [
	"gasoline",
	"diesel",
	"electric",
	"hybrid",
	"phev",
] as const;

export const ENUM_TRANS = [
	"automatic",
	"cvt",
	"e-cvt",
	"manual",
	"none",
] as const;

export const ENUM_SIZE = ["compact", "mid-size", "large"] as const;

export const ENUM_STATUS = [
	"purchased",
	"leased",
	"rented",
	"returned",
] as const;

export const ENUM_XWD = ["fwd", "rwd", "awd", "4wd"] as const;

export const car = sqliteTable(
	"car",
	{
		class: text("class", { enum: ENUM_CLASS }).notNull(),
		estLifespanKM: integer("est_lifespan_km").notNull(),
		generation: real("generation").notNull(),
		id: integer("id").primaryKey(),
		image: text("image"),
		make: integer("make")
			.references(() => carManufacturer.id)
			.notNull(),
		model: text("model").notNull(),
		seats: integer().notNull(),
		size: text("size", { enum: ENUM_SIZE }),
		tagline: text("tagline"),
		website: text("website"),
		year: integer("year").notNull(),
	},
	(t) => [unique().on(t.year, t.make, t.model)],
);

export const carBorrowRate = sqliteTable("car_borrow_rate", {
	car: integer("car")
		.references(() => car.id)
		.notNull(),
	durationMonths: integer("duration_months"),
	id: integer("id").primaryKey(),
	type: text("type").notNull(),
});

export const carManufacturer = sqliteTable("car_manufacturer", {
	country: text("country", { enum: ENUM_COUNTRIES }).notNull(),
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	website: text("website").notNull(),
});

export const carTrim = sqliteTable(
	"car_trim",
	{
		car: integer("car")
			.notNull()
			.references(() => car.id),
		fuel: text("fuel", { enum: ENUM_FUEL }).notNull(),
		fuelEcon: real("fuel_econ").notNull(),
		id: integer("id").primaryKey(),
		name: text("name").notNull(),
		price: integer("price").notNull(),
		transmission: text("transmission", { enum: ENUM_TRANS }).notNull(),
		xwd: text("xwd", { enum: ENUM_XWD }).notNull(),
	},
	(t) => [unique().on(t.car, t.name)],
);

export const carInventory = sqliteTable("car_inventory", {
	color: text("color").notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(current_timestamp)`),
	id: text("id").primaryKey(),
	mileage: integer("mileage").notNull().default(0),
	purchasable: integer("purchasable", { mode: "boolean" }).notNull(),
	rentable: integer("rentable", { mode: "boolean" }).notNull(),
	trim: integer("trim")
		.notNull()
		.references(() => carTrim.id),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(current_timestamp)`),
});

export const carOrder = sqliteTable(
	"car_order",
	{
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(current_timestamp)`),
		id: text("id").primaryKey(),
		inventory: text("inventory")
			.notNull()
			.references(() => carInventory.id),
		kmDriven: integer("km_driven"),
		maxMileage: integer("max_mileage"),
		ownershipExpiry: integer("ownership_expiry", { mode: "timestamp_ms" }),
		status: text("status", { enum: ENUM_STATUS }).notNull().default("returned"),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(current_timestamp)`),
		user: text("user")
			.notNull()
			.references(() => user.id),
	},
	(t) => [
		uniqueIndex("car_order_active_idx")
			.on(t.inventory)
			.where(sql`${t.status} != 'returned'`),
	],
);

export const carRelations = relations(car, ({ one, many }) => ({
	make: one(carManufacturer, {
		fields: [car.make],
		references: [carManufacturer.id],
	}),
	trims: many(carTrim),
}));

export const carTrimRelations = relations(carTrim, ({ one }) => ({
	car: one(car, { fields: [carTrim.car], references: [car.id] }),
}));

export const carInventoryRelations = relations(carInventory, ({ one }) => ({
	trim: one(carTrim, {
		fields: [carInventory.trim],
		references: [carTrim.id],
	}),
}));
