import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
	throw new Error("missing environment variable: DATABASE_URL");
}

export default defineConfig({
	dbCredentials: {
		authToken: process.env.DATABASE_AUTH_TOKEN,
		url: process.env.DATABASE_URL,
	},
	dialect: process.env.DATABASE_URL.startsWith("http://") ? "sqlite" : "turso",
	out: "./drizzle",
	schema: "./src/db/schema",
});
