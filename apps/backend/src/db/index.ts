import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as accessorySchema from "./schema/accessory";
import * as carSchema from "./schema/car";

const client = createClient({
	authToken: process.env.DATABASE_AUTH_TOKEN,
	url: process.env.DATABASE_URL,
});
export const db = drizzle(client, {
	casing: "snake_case",
	schema: { ...accessorySchema, ...carSchema },
});
