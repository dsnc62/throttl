import { db } from "@/db";

export async function getUserTransactions(userId: string) {
	return await db.query.transaction.findMany({
		orderBy: (fields, { desc }) => desc(fields.createdAt),
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

export async function getAllTransactions() {
	return await db.query.transaction.findMany({
		orderBy: (fields, { desc }) => desc(fields.createdAt),
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

			user: true,
		},
	});
}
