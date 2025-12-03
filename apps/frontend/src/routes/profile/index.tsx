import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

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

export const Route = createFileRoute("/profile/")({
	component: Profile,
});

function Profile() {
	const session = authClient.useSession();

	// form
	const defaultValues: ProfileSchema = useMemo(() => {
		return {
			confirmPassword: undefined,
			email: session.data?.user.email ?? "",
			name: session.data?.user.name ?? "",
			password: undefined,
		};
	}, [session.data]);

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

	// derived
	const disabled = useMemo(() => {
		if (!session.data) return true;

		const formName = form.getFieldValue("name");
		const formEmail = form.getFieldValue("email");
		const newPassword = form.getFieldValue("newPassword");

		return (
			formName === session.data.user.name &&
			formEmail === session.data.user.email &&
			!newPassword
		);
	}, [form, session.data]);

	// render
	if (!session.data) {
		return (
			<div className="fixed inset-0 flex items-center justify-center">
				<div className="rounded-lg bg-background p-6 text-center shadow-lg">
					<h2 className="mb-4 font-display font-medium text-2xl">
						You need to be signed in to continue.
					</h2>
					<Button asChild>
						<Link search={{ callbackURL: Route.fullPath }} to="/sign-in">
							Log In
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
			<h1 className="font-display font-semibold text-5xl">Profile</h1>
			<form>
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Account Details</CardTitle>
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
					</CardContent>
				</Card>

				<Field>
					<Button disabled={disabled} type="submit">
						Save
					</Button>
				</Field>
			</form>
		</div>
	);
}
