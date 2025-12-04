import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import z from "zod";
import AuthWall from "@/components/auth-wall";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";
import type { Cart, FullUser } from "@/lib/types";

const checkoutSchema = z
	.object({
		address: z.string().nonempty(),
		cardNumber: z.string().length(16),
		city: z.string().nonempty(),
		email: z.email().nonempty(),
		expMonth: z.number().min(1).max(12),
		expYear: z.number().min(2025),
		name: z.string().nonempty(),
		postalCode: z.string().regex(/[A-Z]\d[A-Z] \d[A-Z]\d/),
		province: z.enum([
			"AB",
			"BC",
			"MB",
			"NB",
			"NL",
			"NT",
			"NS",
			"NU",
			"ON",
			"PE",
			"QC",
			"SK",
			"YT",
		] as const),
		updatePaymentInfo: z.boolean(),
		updateShippingInfo: z.boolean(),
	})
	.superRefine(({ expMonth, expYear }, ctx) => {
		if (expMonth <= today.getMonth() && expYear <= today.getFullYear()) {
			ctx.addIssue({
				code: "custom",
				message: "This card is expired.",
				path: ["expMonth"],
			});
		}
	});
type CheckoutSchema = z.infer<typeof checkoutSchema>;

const today = new Date();

const cadFormatter = Intl.NumberFormat("en-CA", {
	currency: "CAD",
	style: "currency",
});

export const Route = createFileRoute("/shop/checkout/")({
	component: ShopCheckout,
});

function ShopCheckout() {
	// misc. hooks
	const navigate = useNavigate({ from: Route.fullPath });
	const session = authClient.useSession();
	const queryClient = useQueryClient();

	// states
	const [cart, setCart] = useLocalStorage<Cart>("cart", { items: [] });

	// queries
	const { data: cartTotal, isLoading: isLoadingCartTotal } = useQuery({
		queryFn: async () => {
			const res = await fetch(`${env.VITE_BACKEND_URL}/api/cart/total`, {
				body: JSON.stringify(cart),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			return (await res.json()) as { total: number };
		},
		queryKey: ["cart", "total", JSON.stringify(cart)],
	});

	// form
	const defaultValues: CheckoutSchema = useMemo(() => {
		const user: FullUser | undefined = session.data?.user;
		return {
			address: user?.address ?? "",
			cardNumber: user?.cardNumber ?? "",
			city: user?.city ?? "",
			email: session.data?.user.email ?? "",
			expMonth: user?.cardExpMonth ?? today.getMonth() + 1,
			expYear: user?.cardExpYear ?? today.getFullYear(),
			name: session.data?.user.name ?? "",
			postalCode: user?.postalCode ?? "",
			province: user?.province ?? "ON",
			updatePaymentInfo: false,
			updateShippingInfo: false,
		};
	}, [session.data]);

	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			if (!session.data) return;

			if (value.updateShippingInfo) {
				await authClient.updateUser({
					address: value.address.trim(),
					city: value.city.trim(),
					postalCode: value.postalCode.trim(),
					province: value.province,
					// biome-ignore lint/suspicious/noExplicitAny: additional fields
				} as any);
			}

			if (value.updatePaymentInfo) {
				await authClient.updateUser({
					cardExpMonth: value.expMonth,
					cardExpYear: value.expYear,
					cardNumber: value.cardNumber.trim(),
					// biome-ignore lint/suspicious/noExplicitAny: additional fields
				} as any);
			}

			const res = await fetch(`${env.VITE_BACKEND_URL}/api/orders`, {
				body: JSON.stringify({ cart, details: value }),
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});

			if (res.ok) {
				queryClient.invalidateQueries({
					queryKey: ["orders", "users", session.data.user.id, "transactions"],
				});
				toast.success("Thank you for shopping with us!");
				setCart({ items: [] });
				navigate({ to: "/profile/orders" });
			}
		},
		validators: {
			onBlur: checkoutSchema,
			onSubmit: checkoutSchema,
		},
	});

	// effects
	// biome-ignore lint/correctness/useExhaustiveDependencies: only run once
	useEffect(() => {
		if (!cart.items.length) {
			navigate({ to: "/shop" });
		}
	}, []);

	// render
	if (!session.data) {
		return <AuthWall callbackURL={Route.fullPath} />;
	}

	return (
		<form
			className="mx-auto flex w-full max-w-2xl flex-col gap-6"
			onSubmit={(ev) => {
				ev.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<Card>
					<CardHeader>
						<CardTitle>Personal Details</CardTitle>
					</CardHeader>
					<CardContent>
						<FieldGroup>
							<form.Field name="name">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
											<Input
												disabled
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
										<Field>
											<FieldLabel htmlFor={field.name}>Email</FieldLabel>
											<Input
												disabled
												id={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="me@example.com"
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
						</FieldGroup>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Shipping Information</CardTitle>
					</CardHeader>
					<CardContent>
						<FieldGroup>
							<form.Field name="address">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Address</FieldLabel>
											<Input
												id={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="123 Yonge St"
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

							<form.Field name="postalCode">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Postal Code</FieldLabel>
											<Input
												id={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="A1A 1A1"
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

							<form.Field name="city">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>City</FieldLabel>
											<Input
												id={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Toronto"
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
														value as CheckoutSchema["province"],
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
													<SelectItem value="BC">British Columbia</SelectItem>
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

							<form.Field name="updateShippingInfo">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<div className="flex items-center gap-3">
												<Checkbox
													checked={field.state.value}
													id={field.name}
													onBlur={field.handleBlur}
													onCheckedChange={(v) =>
														field.handleChange(
															v === "indeterminate"
																? defaultValues.updateShippingInfo
																: v,
														)
													}
												/>
												<FieldLabel htmlFor={field.name}>
													Update Default Shipping Address
												</FieldLabel>
											</div>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</FieldGroup>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Payment Information</CardTitle>
					</CardHeader>
					<CardContent>
						<FieldGroup>
							<form.Field name="cardNumber">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Card Number</FieldLabel>
											<Input
												id={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="4242424242424242"
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

							<div className="flex gap-4">
								<form.Field name="expMonth">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field className="flex-1">
												<FieldLabel htmlFor={field.name}>Exp Month</FieldLabel>
												<Select
													onValueChange={(value) => {
														field.handleChange(Number(value));
														field.handleBlur();
													}}
													value={field.state.value.toString()}
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

								<form.Field name="expYear">
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
													value={field.state.value.toString()}
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

							<form.Field name="updatePaymentInfo">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<div className="flex items-center gap-3">
												<Checkbox
													checked={field.state.value}
													id={field.name}
													onBlur={field.handleBlur}
													onCheckedChange={(v) =>
														field.handleChange(
															v === "indeterminate"
																? defaultValues.updateShippingInfo
																: v,
														)
													}
												/>
												<FieldLabel htmlFor={field.name}>
													Update Default Payment Info
												</FieldLabel>
											</div>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</FieldGroup>
					</CardContent>
				</Card>

				<Field>
					<Button
						disabled={isLoadingCartTotal || !cartTotal?.total}
						type="submit"
					>
						Order {cartTotal ? `(${cadFormatter.format(cartTotal.total)})` : ""}
					</Button>
				</Field>
			</FieldGroup>
		</form>
	);
}
