import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import * as authSchema from "../db/schema/auth";

export const auth = betterAuth({
	appName: "throttl",
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: { ...authSchema },
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [admin()],
	trustedOrigins: ["http://localhost:3000"],
});
