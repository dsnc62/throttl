import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accessoryOrder } from "./accessory";
import { user } from "./auth";
import { carOrder } from "./car";

const ENUM_TX_PROVINCE = [
	"AB",
	"BC",
	"MB",
	"NB",
	"NL",
	"NT",
	"NS",
	"NU",
	"ON",
	"PE",
	"QC",
	"SK",
	"YT",
] as const;

export const transaction = sqliteTable("transaction", {
	address: text("address").notNull(),
	cardExpMonth: integer("card_exp_month").notNull(),
	cardExpYear: integer("card_exp_year").notNull(),
	cardLast4: text("card_last4").notNull(),
	city: text("city").notNull(),
	id: text("id").primaryKey(),
	postalCode: text("postal_code").notNull(),
	province: text("province", { enum: ENUM_TX_PROVINCE }).notNull(),
	totalPrice: real("total_price").notNull(),
	user: text("user")
		.notNull()
		.references(() => user.id),
});

export const txRelations = relations(transaction, ({ one, many }) => ({
	accessoryOrders: many(accessoryOrder),
	carOrders: many(carOrder),
	user: one(user, {
		fields: [transaction.user],
		references: [user.id],
	}),
}));
