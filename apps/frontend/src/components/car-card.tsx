import { Link } from "@tanstack/react-router";
import type { CarInventory } from "@/lib/types";
import { calculateRent, capitalize } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";

export default function CarCard({ inv }: { inv: CarInventory }) {
	const car = inv.trim.car;

	return (
		<Card>
			<div className="-mt-6 -mb-4 p-2">
				<img
					alt={`${car.year} ${car.make.name} ${car.model}`}
					className="aspect-video w-full rounded-lg border bg-secondary object-cover"
					onError={(ev) => {
						ev.currentTarget.src = "/images/No_car.png";
					}}
					src={car.image ?? "/images/No_car.png"}
				/>
			</div>
			<CardHeader>
				<div className="flex items-start justify-between gap-3">
					<CardTitle>
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
			<CardFooter className="mt-auto items-center justify-end gap-3">
				<Button variant="secondary">
					<Link search={{ id: inv.id }} to="/shop/cars/info">
						Learn More
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
