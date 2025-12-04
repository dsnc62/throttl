import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import z from "zod";
import AuthWall from "@/components/auth-wall";
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
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import type { FullUser } from "@/lib/types";

const profileSchema = z
	.object({
		confirmPassword: z.string().min(8).max(32).optional(),
		currentPassword: z.string().min(8).max(32).optional(),
		email: z.email().nonempty(),
		name: z.string().nonempty(),
		newPassword: z.string().min(8).max(32).optional(),
	})
	.superRefine(({ confirmPassword, currentPassword, newPassword }, ctx) => {
		if (confirmPassword !== newPassword) {
			ctx.addIssue({
				code: "custom",
				message: "The passwords did not match",
				path: ["confirmPassword"],
			});
		}

		if (!!newPassword && !currentPassword) {
			ctx.addIssue({
				code: "custom",
				message: "Please enter your current password",
				path: ["currentPassword"],
			});
		}
	});
type ProfileSchema = z.infer<typeof profileSchema>;

const shippingSchema = z.object({
	address: z.string().nonempty(),
	city: z.string().nonempty(),
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
});
type ShippingSchema = z.infer<typeof shippingSchema>;

const paymentSchema = z
	.object({
		cardNumber: z.string().length(16),
		expMonth: z.number().min(1).max(12),
		expYear: z.number().min(2025),
	})
	.superRefine(({ expMonth, expYear }, ctx) => {
		const today = new Date();
		if (expMonth <= today.getMonth() && expYear <= today.getFullYear()) {
			ctx.addIssue({
				code: "custom",
				message: "This card is expired.",
				path: ["expMonth"],
			});
		}
	});
type PaymentSchema = z.infer<typeof paymentSchema>;

export const Route = createFileRoute("/profile/")({
	component: Profile,
});

function Profile() {
	const session = authClient.useSession();

	// derived
	const user = useMemo(() => {
		if (!session.data) return null;

		return session.data.user as FullUser;
	}, [session.data]);

	// default values
	const defaultValues: ProfileSchema = useMemo(() => {
		return {
			confirmPassword: undefined,
			email: user?.email ?? "",
			name: user?.name ?? "",
			password: undefined,
		};
	}, [user]);

	const shippingDefaultValues: ShippingSchema = useMemo(() => {
		return {
			address: user?.address ?? "",
			city: user?.city ?? "",
			postalCode: user?.postalCode ?? "",
			province: user?.province ?? "ON",
		};
	}, [user]);

	const paymentDefaultValues: PaymentSchema = useMemo(() => {
		const today = new Date();
		return {
			cardNumber: user?.cardNumber ?? "",
			expMonth: user?.cardExpMonth ?? today.getMonth() + 1,
			expYear: user?.cardExpYear ?? today.getFullYear() + 1,
		};
	}, [user]);

	// forms
	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			if (!session.data) return;

			if (value.name !== session.data.user.name) {
				const res = await authClient.updateUser({ name: value.name.trim() });
				if (res.error) {
					toast.error(res.error.message ?? "Could not change name");
				} else {
					toast.success(`Name changed to ${value.name}`);
				}
			}

			if (value.email !== session.data.user.email) {
				const res = await authClient.changeEmail({
					newEmail: value.email.trim(),
				});
				if (res.error) {
					toast.error(res.error.message ?? "Could not change email");
				} else {
					toast.success(`Email changed to ${value.email}`);
				}
			}

			if (session.data.user.role === "admin") {
				return;
			}

			if (value.newPassword && value.currentPassword) {
				const res = await authClient.changePassword({
					currentPassword: value.currentPassword,
					newPassword: value.newPassword,
				});
				if (res.error) {
					toast.error(res.error.message ?? "Could not change password");
				} else {
					toast.success("Password changed successfully");
				}
			}
		},
		validators: {
			onBlur: profileSchema,
			onSubmit: profileSchema,
		},
	});

	const shippingForm = useForm({
		defaultValues: shippingDefaultValues,
		onSubmit: async ({ value }) => {
			if (!session.data) return;

			const res = await authClient.updateUser({
				address: value.address.trim(),
				city: value.city.trim(),
				postalCode: value.postalCode.trim(),
				province: value.province,
				// biome-ignore lint/suspicious/noExplicitAny: additional fields
			} as any);

			if (res.error) {
				toast.error(
					res.error.message ?? "Could not update shipping information",
				);
			} else {
				toast.success("Shipping information updated successfully");
			}
		},
		validators: {
			onBlur: shippingSchema,
			onSubmit: shippingSchema,
		},
	});

	const paymentForm = useForm({
		defaultValues: paymentDefaultValues,
		onSubmit: async ({ value }) => {
			if (!session.data) return;

			const res = await authClient.updateUser({
				cardExpMonth: value.expMonth,
				cardExpYear: value.expYear,
				cardNumber: value.cardNumber.trim(),
				// biome-ignore lint/suspicious/noExplicitAny: additional fields
			} as any);

			if (res.error) {
				toast.error(
					res.error.message ?? "Could not update payment information",
				);
			} else {
				toast.success("Payment information updated successfully");
			}
		},
		validators: {
			onBlur: paymentSchema,
			onSubmit: paymentSchema,
		},
	});

	// effects
	useEffect(() => {
		if (paymentDefaultValues) {
			setTimeout(() => {
				paymentForm.reset();
				paymentForm.setFieldValue(
					"cardNumber",
					paymentDefaultValues.cardNumber,
				);
				paymentForm.setFieldValue("expMonth", paymentDefaultValues.expMonth);
				paymentForm.setFieldValue("expYear", paymentDefaultValues.expYear);
			}, 100);
		}
	}, [paymentDefaultValues, paymentForm]);

	// render
	if (!session.data) {
		return <AuthWall callbackURL={Route.fullPath} />;
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
			<h1 className="font-display font-semibold text-5xl">Profile</h1>

			{/* Account Details Form */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Account Details</CardTitle>
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
										<Field>
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
										<Field>
											<FieldLabel htmlFor={field.name}>Email</FieldLabel>
											<Input
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

						<FieldGroup hidden={session.data.user.role === "admin"}>
							<Separator className="-mb-2 mt-6" />
							<form.Field name="newPassword">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>New Password</FieldLabel>
											<Input
												disabled={session.data?.user.role === "admin"}
												id={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												type="password"
												value={field.state.value}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="confirmPassword">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>
												Confirm Password
											</FieldLabel>
											<Input
												disabled={session.data?.user.role === "admin"}
												id={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												type="password"
												value={field.state.value}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="currentPassword">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>
												Current Password
											</FieldLabel>
											<Input
												disabled={session.data?.user.role === "admin"}
												id={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												type="password"
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

						<Field className="mt-7">
							<Button type="submit">Save</Button>
						</Field>
					</form>
				</CardContent>
			</Card>

			{/* Shipping Information Form */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Shipping Information</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(ev) => {
							ev.preventDefault();
							shippingForm.handleSubmit();
						}}
					>
						<FieldGroup>
							<shippingForm.Field name="address">
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
							</shippingForm.Field>

							<shippingForm.Field name="postalCode">
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
							</shippingForm.Field>

							<shippingForm.Field name="city">
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
							</shippingForm.Field>

							<shippingForm.Field name="province">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Province</FieldLabel>
											<Select
												onValueChange={(value) => {
													field.handleChange(
														value as ShippingSchema["province"],
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
							</shippingForm.Field>
						</FieldGroup>
						<Field className="mt-7">
							<Button type="submit">Save</Button>
						</Field>
					</form>
				</CardContent>
			</Card>

			{/* Payment Information Form */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Payment Information</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(ev) => {
							ev.preventDefault();
							paymentForm.handleSubmit();
						}}
					>
						<FieldGroup>
							<paymentForm.Field name="cardNumber">
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
							</paymentForm.Field>

							<div className="flex gap-4">
								<paymentForm.Field name="expMonth">
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
								</paymentForm.Field>

								<paymentForm.Field name="expYear">
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
								</paymentForm.Field>
							</div>
						</FieldGroup>
						<Field className="mt-7">
							<Button type="submit">Save</Button>
						</Field>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
