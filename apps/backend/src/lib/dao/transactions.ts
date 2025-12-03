import { db } from "@/db";

export async function getUserTransactionsWithOrders(userId: string) {
	return await db.query.transaction.findMany({
		where: (fields, { eq }) => eq(fields.user, userId),
		with: {
			accessoryOrders: {
				with: {
					inventory: {
						with: {
							accessory: true,
						},
					},
				},
			},
			carOrders: {
				with: {
					inventory: {
						with: {
							trim: {
								with: {
									car: {
										with: {
											make: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});
}
