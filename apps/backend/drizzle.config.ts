import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
	throw new Error("missing environment variable: DATABASE_URL");
}

export default defineConfig({
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
	dialect: "sqlite",
	out: "./drizzle",
	schema: "./src/db/schema",
});
