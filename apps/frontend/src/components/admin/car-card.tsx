import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { env } from "@/env";
import type { CarInventory } from "@/lib/types";
import { calculateRent, capitalize } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function AdminCarCard({ inv }: { inv: CarInventory }) {
	const queryClient = useQueryClient();
	const car = inv.trim.car;

	// schema
	const carsInvSchema = z.object({
		mileage: z
			.number()
			.min(inv.mileage, "Cannot decrease mileage, that's illegal"),
		purchasable: z.boolean(),
		rentable: z.boolean(),
	});
	type CarInvSchema = z.infer<typeof carsInvSchema>;

	// form
	const defaultValues: CarInvSchema = {
		mileage: inv.mileage,
		purchasable: inv.purchasable,
		rentable: inv.rentable,
	};
	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/cars/inventory/${inv.id}`,
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
					queryKey: ["cars", "inventory"],
				});
			}
		},
		validators: {
			onBlur: carsInvSchema,
			onSubmit: carsInvSchema,
		},
	});

	return (
		<Card className="relative flex-row p-2">
			<img
				alt={`${car.year} ${car.make.name} ${car.model}`}
				className="aspect-video w-44 rounded-lg border bg-secondary object-cover"
				onError={(ev) => {
					ev.currentTarget.src = "/images/No_car.png";
				}}
				src={car.image ?? "/images/No_car.png"}
			/>
			<CardHeader className="flex flex-1 flex-col p-2">
				<div className="flex w-full items-start justify-between gap-3">
					<CardTitle className="flex-1">
						{car.year} {car.make.name} {car.model} {inv.trim.name}
					</CardTitle>

					{inv.purchasable ? (
						<span className="leading-none">
							{Intl.NumberFormat("en-CA", {
								currency: "CAD",
								maximumFractionDigits: 0,
								style: "currency",
							}).format(inv.trim.price)}
						</span>
					) : (
						<span className="leading-none">
							{Intl.NumberFormat("en-CA", {
								currency: "CAD",
								maximumFractionDigits: 0,
								style: "currency",
							}).format(
								calculateRent(inv.trim.price, 1, inv.trim.car.estLifespanKM),
							)}
							/day
						</span>
					)}
				</div>
				<CardDescription className="flex items-center">
					<div
						className="mr-1 size-3 rounded-full border border-foreground/30"
						style={{
							backgroundColor: inv.color.replaceAll(" ", ""),
						}}
					></div>
					{capitalize(inv.color)} • {inv.trim.xwd.toUpperCase()} •{" "}
					{inv.purchasable ? inv.mileage : "Unlimited "}KM
				</CardDescription>
				<div className="flex items-center gap-2">
					{inv.purchasable && <Badge>Purchasable</Badge>}
					{inv.rentable && <Badge variant="outline">Rentable</Badge>}
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
							<form.Field name="mileage">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Mileage</FieldLabel>
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
							<form.Field name="purchasable">
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
																? defaultValues.purchasable
																: v,
														)
													}
												/>
												<FieldLabel htmlFor={field.name}>
													Purchasable
												</FieldLabel>
											</div>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
							<form.Field name="rentable">
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
																? defaultValues.rentable
																: v,
														)
													}
												/>
												<FieldLabel htmlFor={field.name}>Rentable</FieldLabel>
											</div>
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
