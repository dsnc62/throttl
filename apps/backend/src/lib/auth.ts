import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db";

export const auth = betterAuth({
	appName: "throttl",
	database: drizzleAdapter(db, { provider: "sqlite" }),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [admin()],
});
