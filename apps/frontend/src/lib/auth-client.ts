import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
	baseURL: env.VITE_BACKEND_URL,
	plugins: [adminClient()],
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
