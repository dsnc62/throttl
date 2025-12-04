import { relations, sql } from "drizzle-orm";
import {
	integer,
	primaryKey,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { car } from "./car";
import { transaction } from "./transaction";

export const ENUM_CAT = [
	"air fresheners",
	"cleaning",
	"dashcams",
	"exterior protection",
	"mats",
] as const;

export const ENUM_STATUS = [
	"purchased",
	"leased",
	"rented",
	"returned",
] as const;

export const accessory = sqliteTable("accessory", {
	category: text("category", { enum: ENUM_CAT }).notNull(),
	id: integer("id").primaryKey(),
	image: text("image"),
	make: text("make").notNull(),
	name: text("name").notNull(),
	price: real("price").notNull(),
	universal: integer("universal", { mode: "boolean" }).notNull().default(false),
});

export const accessoryCarXref = sqliteTable(
	"accessory_car_xref",
	{
		accessory: integer()
			.references(() => accessory.id)
			.notNull(),
		car: integer()
			.references(() => car.id)
			.notNull(),
	},
	(t) => [primaryKey({ columns: [t.accessory, t.car] })],
);

export const accessoryInventory = sqliteTable("accessory_inventory", {
	accessory: integer("accessory")
		.notNull()
		.references(() => accessory.id),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(current_timestamp)`),
	discarded: integer("discarded", { mode: "boolean" }).default(false),
	id: text("id").primaryKey(),
});

export const accessoryOrder = sqliteTable(
	"accessory_order",
	{
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(current_timestamp)`),
		inventory: text("inventory")
			.notNull()
			.references(() => accessoryInventory.id),
		status: text("status", { enum: ENUM_STATUS })
			.notNull()
			.default("purchased"),
		tx: text("tx")
			.notNull()
			.references(() => transaction.id),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(t) => [primaryKey({ columns: [t.inventory, t.tx] })],
);

export const accessoryRelations = relations(accessory, ({ many }) => ({
	cars: many(accessoryCarXref),
	inventories: many(accessoryInventory),
}));

export const accessoryCarXrefRelations = relations(
	accessoryCarXref,
	({ one }) => ({
		accessory: one(accessory, {
			fields: [accessoryCarXref.accessory],
			references: [accessory.id],
		}),
		car: one(car, {
			fields: [accessoryCarXref.car],
			references: [car.id],
		}),
	}),
);

export const accessoryInventoryRelations = relations(
	accessoryInventory,
	({ one }) => ({
		accessory: one(accessory, {
			fields: [accessoryInventory.accessory],
			references: [accessory.id],
		}),
	}),
);

export const accessoryOrderRelations = relations(accessoryOrder, ({ one }) => ({
	inventory: one(accessoryInventory, {
		fields: [accessoryOrder.inventory],
		references: [accessoryInventory.id],
	}),
	tx: one(transaction, {
		fields: [accessoryOrder.tx],
		references: [transaction.id],
	}),
}));
