import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { differenceInDays, format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import AdminWrapper from "@/components/admin/admin-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";
import type { CarPurchaseDetails, FullUser, Transaction } from "@/lib/types";
import { calculateRent } from "@/lib/utils";

const cadFormatter = Intl.NumberFormat("en-CA", {
	currency: "CAD",
	style: "currency",
});

const adminUsersInfoSearchSchema = z.object({
	id: z.string(),
});

const userFormSchema = z
	.object({
		address: z.string().optional(),
		cardExpMonth: z.number().min(1).max(12).optional(),
		cardExpYear: z.number().min(new Date().getFullYear()).optional(),
		cardNumber: z.string().optional(),
		city: z.string().optional(),
		email: z.email().nonempty(),
		name: z.string().nonempty(),
		postalCode: z.string().optional(),
		province: z.string().optional(),
	})
	.superRefine(({ cardExpMonth, cardExpYear }, ctx) => {
		const today = new Date();

		if (cardExpMonth && cardExpYear) {
			if (
				cardExpMonth <= today.getMonth() &&
				cardExpYear <= today.getFullYear()
			) {
				ctx.addIssue({
					code: "custom",
					message: "This card is expired.",
					path: ["expMonth"],
				});
			}
		}
	});

type UserFormSchema = z.infer<typeof userFormSchema>;

export const Route = createFileRoute("/admin/users/info")({
	component: AdminUsersInfo,
	validateSearch: adminUsersInfoSearchSchema,
});

function AdminUsersInfo() {
	const { id } = Route.useSearch();
	const queryClient = useQueryClient();

	// queries
	const { data: user, isLoading: userLoading } = useQuery({
		enabled: !!id,
		queryFn: async () => {
			return (await authClient.admin.getUser({ query: { id } })).data as
				| FullUser
				| null
				| undefined;
		},
		queryKey: ["admin", "users", id ?? "UNKNOWN"],
	});

	const { data: transactions, isLoading: transactionsLoading } = useQuery({
		enabled: !!id,
		queryFn: async () => {
			if (!id) return undefined;

			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/orders/users/${id}/transactions`,
				{
					credentials: "include",
				},
			);

			const data = (await res.json()) as Transaction[];
			return data;
		},
		queryKey: ["orders", "users", id ?? "unauth", "transactions"],
	});

	// states
	const [purchaseDetails, setPurchaseDetails] = useState<
		Record<string, CarPurchaseDetails>
	>({});

	// form
	const form = useForm({
		defaultValues: {
			address: user?.address ?? "",
			cardExpMonth: user?.cardExpMonth ?? undefined,
			cardExpYear: user?.cardExpYear ?? undefined,
			cardNumber: user?.cardNumber ?? "",
			city: user?.city ?? "",
			email: user?.email ?? "",
			name: user?.name ?? "",
			postalCode: user?.postalCode ?? "",
			province: user?.province ?? "",
		} as UserFormSchema,
		onSubmit: async ({ value }) => {
			try {
				await authClient.admin.updateUser({
					data: value,
					userId: id,
				});
				toast.success("User updated successfully");
				queryClient.invalidateQueries({
					queryKey: ["auth", "admin", "users", id],
				});
			} catch (error) {
				toast.error("Failed to update user");
				console.error(error);
			}
		},
		validators: {
			onBlur: userFormSchema,
			onSubmit: userFormSchema,
		},
	});

	// render
	if (userLoading) {
		return <Spinner />;
	}

	if (!user) {
		return <div>User not found</div>;
	}

	return (
		<AdminWrapper fullPath={Route.fullPath}>
			<div className="space-y-8">
				<div>
					<h1 className="font-display font-semibold text-5xl">{user.name}</h1>
					<p className="mt-2 text-muted-foreground capitalize">
						Role: {user.role || "user"}
					</p>
				</div>

				<Card className="container mx-auto">
					<CardHeader>
						<CardTitle>User Information</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(ev) => {
								ev.preventDefault();
								form.handleSubmit();
							}}
						>
							<FieldGroup>
								<form.Field name="name">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
												<Input
													id={field.name}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="John Doe"
													required
													type="text"
													value={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<form.Field name="email">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Email</FieldLabel>
												<Input
													id={field.name}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="user@example.com"
													required
													type="email"
													value={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<form.Field name="address">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Address</FieldLabel>
												<Input
													id={field.name}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="123 Main St"
													type="text"
													value={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<div className="grid grid-cols-2 gap-4">
									<form.Field name="city">
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>City</FieldLabel>
													<Input
														id={field.name}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="Toronto"
														type="text"
														value={field.state.value}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>

									<form.Field name="province">
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field>
													<FieldLabel htmlFor={field.name}>Province</FieldLabel>
													<Select
														onValueChange={(value) => {
															field.handleChange(
																value as Transaction["province"],
															);
															field.handleBlur();
														}}
														value={field.state.value}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select province" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="AB">Alberta</SelectItem>
															<SelectItem value="BC">
																British Columbia
															</SelectItem>
															<SelectItem value="MB">Manitoba</SelectItem>
															<SelectItem value="NB">New Brunswick</SelectItem>
															<SelectItem value="NL">
																Newfoundland and Labrador
															</SelectItem>
															<SelectItem value="NT">
																Northwest Territories
															</SelectItem>
															<SelectItem value="NS">Nova Scotia</SelectItem>
															<SelectItem value="NU">Nunavut</SelectItem>
															<SelectItem value="ON">Ontario</SelectItem>
															<SelectItem value="PE">
																Prince Edward Island
															</SelectItem>
															<SelectItem value="QC">Quebec</SelectItem>
															<SelectItem value="SK">Saskatchewan</SelectItem>
															<SelectItem value="YT">Yukon</SelectItem>
														</SelectContent>
													</Select>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>
								</div>

								<form.Field name="postalCode">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Postal Code
												</FieldLabel>
												<Input
													id={field.name}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="A1A 1A1"
													type="text"
													value={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<form.Field name="cardNumber">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Card Number
												</FieldLabel>
												<Input
													id={field.name}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="4242424242424242"
													type="text"
													value={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<div className="grid grid-cols-2 gap-4">
									<form.Field name="cardExpMonth">
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field className="flex-1">
													<FieldLabel htmlFor={field.name}>
														Exp Month
													</FieldLabel>
													<Select
														onValueChange={(value) => {
															field.handleChange(Number(value));
															field.handleBlur();
														}}
														value={field.state.value?.toString()}
													>
														<SelectTrigger>
															<SelectValue placeholder="Month" />
														</SelectTrigger>
														<SelectContent>
															{Array.from({ length: 12 }, (_, i) => (
																<SelectItem
																	key={(i + 1).toString()}
																	value={(i + 1).toString()}
																>
																	{(i + 1).toString().padStart(2, "0")}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>

									<form.Field name="cardExpYear">
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											const currentYear = new Date().getFullYear();
											return (
												<Field className="flex-1">
													<FieldLabel htmlFor={field.name}>Exp Year</FieldLabel>
													<Select
														onValueChange={(value) => {
															field.handleChange(Number(value));
															field.handleBlur();
														}}
														value={field.state.value?.toString()}
													>
														<SelectTrigger>
															<SelectValue placeholder="Year" />
														</SelectTrigger>
														<SelectContent>
															{Array.from({ length: 11 }, (_, i) => (
																<SelectItem
																	key={(currentYear + i).toString()}
																	value={(currentYear + i).toString()}
																>
																	{currentYear + i}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>
								</div>

								<Field>
									<Button disabled={form.state.isSubmitting} type="submit">
										{form.state.isSubmitting ? "Saving..." : "Save Changes"}
									</Button>
								</Field>
							</FieldGroup>
						</form>
					</CardContent>
				</Card>

				<section className="container mx-auto">
					<h2 className="mb-4 font-display font-medium text-3xl">
						Order History
					</h2>

					{transactions?.length ? (
						<div className="flex flex-col gap-4">
							{transactions.map((tx) => (
								<div key={`tx-${tx.id}`}>
									<h3 className="font-display font-medium text-xl">
										Order #{tx.id.split("-")[0]}
									</h3>
									<span className="text-muted-foreground">
										{format(tx.createdAt, "PPp")}
									</span>
									<Table>
										<TableCaption>Reference ID: {tx.id}</TableCaption>
										<TableHeader>
											<TableRow>
												<TableHead className="w-[100px]">ID</TableHead>
												<TableHead>Name</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Status</TableHead>
												<TableHead className="text-right">Amount</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{tx.accessoryOrders?.map((order) => (
												<TableRow key={`acc-order-${order.inventory.id}`}>
													<TableCell className="font-medium">
														{order.inventory.id}
													</TableCell>
													<TableCell>
														{order.inventory.accessory.name}
													</TableCell>
													<TableCell>Accessory</TableCell>
													<TableCell className="capitalize">
														{order.status}
													</TableCell>
													<TableCell className="text-right">
														{cadFormatter.format(
															order.inventory.accessory.price,
														)}
													</TableCell>
												</TableRow>
											))}
											{tx.carOrders?.map((order) => {
												const car = order.inventory.trim.car;
												let price: number | undefined;

												if (order.orderType === "rent") {
													price = calculateRent(
														order.inventory.trim.price,
														differenceInDays(
															order.ownershipExpiry ?? order.createdAt,
															order.createdAt,
														),
														car.estLifespanKM,
													);
												} else {
													const details = purchaseDetails[order.id];
													if (details) {
														price = details.totalPrice;
													} else {
														getCarDetails(order.id).then((d) => {
															if (!d) return;
															setPurchaseDetails((prev) => ({
																...prev,
																[order.id]: d,
															}));
														});
													}
												}

												return (
													<TableRow key={`car-order-${order.inventory.id}`}>
														<TableCell className="font-medium">
															{order.inventory.id}
														</TableCell>
														<TableCell>
															{car.make.name} {car.model}{" "}
															{order.inventory.trim.name}
														</TableCell>
														<TableCell>Car</TableCell>
														<TableCell className="capitalize">
															{order.status}
														</TableCell>
														<TableCell className="text-right">
															{price ? cadFormatter.format(price) : "N/A"}
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</div>
							))}
						</div>
					) : transactionsLoading ? (
						<Spinner />
					) : (
						<div className="text-muted-foreground">
							No orders found for this user.
						</div>
					)}
				</section>
			</div>
		</AdminWrapper>
	);
}

async function getCarDetails(orderID: string) {
	const res = await fetch(
		`${env.VITE_BACKEND_URL}/api/orders/cars/${orderID}/details`,
		{
			credentials: "include",
		},
	);
	const data = (await res.json()) as CarPurchaseDetails | undefined;
	return data;
}
