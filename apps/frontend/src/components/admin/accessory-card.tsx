import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { env } from "@/env";
import type { Accessory } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function AccessoryCard({ accessory }: { accessory: Accessory }) {
	const queryClient = useQueryClient();

	// schema
	const schema = z.object({
		price: z.number().min(0),
		qty: z.int(),
	});
	type Schema = z.infer<typeof schema>;

	// form
	const defaultValues: Schema = {
		price: accessory.price,
		qty: accessory.inventories.length,
	};
	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/accessories/${accessory.id}`,
				{
					body: JSON.stringify(value),
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					method: "PATCH",
				},
			);
			if (res.ok) {
				toast.success("Updated successfully");
				await queryClient.invalidateQueries({
					queryKey: ["accessories"],
				});
			}
		},
		validators: {
			onBlur: schema,
			onSubmit: schema,
		},
	});

	return (
		<Card className="relative flex-row p-2">
			<img
				alt={`${accessory.name} by ${accessory.make}`}
				className="aspect-video w-44 rounded-lg border bg-secondary object-cover"
				onError={(ev) => {
					ev.currentTarget.src = "/images/Missing-image.png";
				}}
				src={accessory.image ?? "Missing-image.png"}
			/>
			<CardHeader className="flex flex-1 flex-col p-2">
				<div className="flex w-full items-start justify-between gap-3">
					<CardTitle className="flex-1">{accessory.name}</CardTitle>
					<span className="leading-none">
						{Intl.NumberFormat("en-CA", {
							currency: "CAD",
							style: "currency",
						}).format(accessory.price)}
					</span>
				</div>
				<CardDescription className="flex items-center">
					by {accessory.make}
				</CardDescription>
				<div className="flex items-center gap-2">
					<Badge
						variant={
							accessory.inventories.length === 0 ? "destructive" : "outline"
						}
					>
						Stock: {accessory.inventories.length}
					</Badge>
					{accessory.universal && <Badge variant="secondary">Universal</Badge>}
				</div>
			</CardHeader>
			<Popover>
				<PopoverTrigger asChild>
					<Button className="absolute right-2 bottom-2" variant="secondary">
						Manage
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-72">
					<form
						onSubmit={(ev) => {
							ev.preventDefault();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field name="price">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Price</FieldLabel>
											<Input
												id={field.name}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(Number(e.target.value))
												}
												required
												type="number"
												value={field.state.value}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
							<form.Field name="qty">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
											<Input
												id={field.name}
												min={0}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(Number(e.target.value))
												}
												required
												type="number"
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
								<Button type="submit">Save</Button>
							</Field>
						</FieldGroup>
					</form>
				</PopoverContent>
			</Popover>
		</Card>
	);
}
