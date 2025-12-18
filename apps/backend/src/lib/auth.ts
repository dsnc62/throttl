import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "../db/index.js";
import * as authSchema from "../db/schema/auth.js";

export const auth = betterAuth({
	advanced: {
		crossSubDomainCookies: {
			domain: "onrender.com",
			enabled: true,
		},
	},
	appName: "throttl",
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: { ...authSchema },
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [admin()],
	trustedOrigins: [
		"http://localhost:3000",
		"https://throttl-frontend.onrender.com",
	],
	user: {
		additionalFields: {
			address: {
				input: true,
				required: false,
				type: "string",
			},
			cardExpMonth: {
				input: true,
				required: false,
				type: "number",
			},
			cardExpYear: {
				input: true,
				required: false,
				type: "number",
			},
			cardNumber: {
				input: true,
				required: false,
				type: "string",
			},
			city: {
				input: true,
				required: false,
				type: "string",
			},
			postalCode: {
				input: true,
				required: false,
				type: "string",
			},
			province: {
				input: true,
				required: false,
				type: "string",
			},
		},
	},
});
