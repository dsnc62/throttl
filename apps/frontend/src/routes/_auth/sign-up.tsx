import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const signUpSearchSchema = z.object({
	callbackURL: z.string().optional(),
});

const signUpSchema = z
	.object({
		confirmPassword: z.string().min(8).max(32),
		email: z.email(),
		name: z.string().nonempty(),
		password: z.string().min(8).max(32),
	})
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				code: "custom",
				message: "The passwords did not match",
				path: ["confirmPassword"],
			});
		}
	});
type SignUpSchema = z.infer<typeof signUpSchema>;

const defaultValues: SignUpSchema = {
	confirmPassword: "",
	email: "",
	name: "",
	password: "",
};

export const Route = createFileRoute("/_auth/sign-up")({
	component: AuthSignUp,
	validateSearch: signUpSearchSchema,
});

function AuthSignUp() {
	const { callbackURL } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					...value,
					callbackURL: callbackURL ?? "/shop",
				},
				{
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
					onSuccess: () => {
						toast.success("Welcome!");
						navigate({ to: callbackURL ?? "/shop" });
					},
				},
			);
		},
		validators: {
			onBlur: signUpSchema,
			onSubmit: signUpSchema,
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create an account</CardTitle>
				<CardDescription>
					Enter your information below to create your account
				</CardDescription>
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
											aria-invalid={isInvalid}
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

						<form.Field name="password">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;

								return (
									<Field>
										<FieldLabel htmlFor={field.name}>Password</FieldLabel>
										<Input
											id={field.name}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											required
											type="password"
											value={field.state.value}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
										<FieldDescription>
											Must be at least 8 characters long.
										</FieldDescription>
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
											id={field.name}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											required
											type="password"
											value={field.state.value}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
										<FieldDescription>
											Please confirm your password.
										</FieldDescription>
									</Field>
								);
							}}
						</form.Field>

						<FieldGroup>
							<Field>
								<Button type="submit">Create Account</Button>
								<FieldDescription className="px-6 text-center">
									Already have an account? <Link to="/sign-in">Sign in</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
