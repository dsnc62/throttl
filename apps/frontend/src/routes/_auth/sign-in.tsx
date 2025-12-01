import { revalidateLogic, useForm } from "@tanstack/react-form";
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

const signInSearchSchema = z.object({
	callbackURL: z.string().optional(),
});

const signInSchema = z.object({
	email: z.email(),
	password: z.string().min(8).max(32),
});
type SignInSchema = z.infer<typeof signInSchema>;

const defaultValues: SignInSchema = {
	email: "",
	password: "",
};

export const Route = createFileRoute("/_auth/sign-in")({
	component: AuthSignIn,
	validateSearch: signInSearchSchema,
});

function AuthSignIn() {
	const { callbackURL } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					...value,
					callbackURL: callbackURL ?? "/shop",
				},
				{
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
					onSuccess: () => {
						toast.success("Welcome back!");
						navigate({ to: callbackURL ?? "/shop" });
					},
				},
			);
		},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "submit",
		}),
		validators: {
			onSubmit: signInSchema,
		},
	});

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
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
										</Field>
									);
								}}
							</form.Field>

							<Field>
								<Button type="submit">Login</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
