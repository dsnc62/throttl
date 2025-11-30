import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import z from "zod";
import { ShopNav } from "@/components/shop/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { env } from "@/env";
import type { CarInventory } from "@/lib/types";
import { calculateRent, capitalize } from "@/lib/utils";

const shopCarsSearchSchema = z.object({
	page: z.number().optional().default(0),
});

export const Route = createFileRoute("/shop/cars/")({
	component: ShopCars,
	validateSearch: shopCarsSearchSchema,
});

function ShopCars() {
	const { page } = Route.useSearch();

	const { data } = useQuery({
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/cars/inventory?limit=12&offset=${(page ?? 0) * 12}`,
			);
			return (await res.json()) as CarInventory[];
		},
		queryKey: ["cars", "inventory", `page=${page ?? 0}`],
	});

	return (
		<>
			<ShopNav />
			<main className="flex flex-col gap-6 p-8">
				<section>
					<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{data?.map((inv) => {
							const car = inv.trim.car;

							return (
								<Card key={`car-inv-${inv.id}`}>
									<CardHeader>
										<img
											alt={`${car.year} ${car.make.name} ${car.model}`}
											className="aspect-video rounded-lg"
											src=""
										/>
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
														calculateRent(
															inv.trim.price,
															1,
															inv.trim.car.estLifespanKM,
														),
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
											{inv.rentable && (
												<Badge variant="outline">Rentable</Badge>
											)}
										</div>
									</CardHeader>
									<CardFooter className="mt-auto items-center justify-end gap-3">
										<Button variant="secondary">
											<Link search={{ id: inv.id }} to="/shop/cars/info">
												Learn More
											</Link>
										</Button>
										<Button>Order</Button>
									</CardFooter>
								</Card>
							);
						})}
					</div>
					<div className="mx-auto mt-4 flex items-center justify-center gap-2">
						<Button asChild={!!page} disabled={!page} variant="secondary">
							<Link search={{ page: (page ?? 1) - 1 }} to="/shop/cars">
								Back
							</Link>
						</Button>
						<Button
							asChild={!!data?.length && data.length >= 12}
							disabled={!data?.length || data.length < 12}
							variant="secondary"
						>
							<Link search={{ page: (page ?? 0) + 1 }} to="/shop/cars">
								Next
							</Link>
						</Button>
					</div>
				</section>
			</main>
		</>
	);
}
