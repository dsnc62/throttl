import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import type { Accessory, CarInventory } from "@/lib/types";
import { calculateRent, capitalize } from "@/lib/utils";
import CarCard from "@/components/car-card";

export const Route = createFileRoute("/shop/")({
	component: Shop,
});

function Shop() {
	const { data: carInventory } = useQuery({
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/cars/inventory?limit=6`,
			);
			return (await res.json()) as CarInventory[];
		},
		queryKey: ["cars", "inventory"],
	});

	const { data: accessories } = useQuery({
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/accessories?limit=6`,
			);
			return (await res.json()) as Accessory[];
		},
		queryKey: ["accessories"],
	});

	return (
		<>
			<section>
				<div className="mb-4 flex items-center gap-6">
					<h2 className="font-display font-semibold text-4xl">Cars</h2>
					<Button asChild size="lg" variant="secondary">
						<Link to="/shop/cars">See All</Link>
					</Button>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{carInventory?.map((inv) => {
						return <CarCard inv={inv} key={`car-inv-${inv.id}`} />;
					})}
				</div>
			</section>

			<section>
				<div className="mb-4 flex items-center gap-6">
					<h2 className="font-display font-semibold text-4xl">Accessories</h2>
					<Button asChild size="lg" variant="secondary">
						<Link to="/shop/accessories">See All</Link>
					</Button>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{accessories?.map((accessory) => {
						return (
							<Card key={`acc-${accessory.id}`}>
								<CardHeader>
									<img
										alt={`${accessory.name} by ${accessory.make}`}
										className="aspect-video rounded-lg"
										src=""
									/>
									<div className="flex items-start justify-between">
										<CardTitle>{accessory.name}</CardTitle>
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
										{accessory.universal && (
											<Badge variant="secondary">Universal</Badge>
										)}
									</div>
								</CardHeader>
								<CardFooter className="items-center justify-end gap-3">
									<Button variant="secondary">
										<Link
											search={{ id: accessory.id }}
											to="/shop/accessories/info"
										>
											Learn More
										</Link>
									</Button>
									<Button disabled={accessory.inventories.length <= 0}>
										{accessory.inventories.length > 0
											? "Add to Cart"
											: "Sold Out"}
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			</section>
		</>
	);
}
