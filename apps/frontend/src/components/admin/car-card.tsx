import { Link } from "@tanstack/react-router";
import type { CarInventory } from "@/lib/types";
import { calculateRent, capitalize } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

export default function AdminCarCard({ inv }: { inv: CarInventory }) {
	const car = inv.trim.car;

	return (
		<Card className="flex-row p-2">
			<div>
				<img
					alt={`${car.year} ${car.make.name} ${car.model}`}
					className="aspect-video w-44 rounded-lg border bg-secondary object-cover"
					onError={(ev) => {
						ev.currentTarget.src = "/images/No_car.png";
					}}
					src={car.image ?? "/images/No_car.png"}
				/>
			</div>
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
		</Card>
	);
}
