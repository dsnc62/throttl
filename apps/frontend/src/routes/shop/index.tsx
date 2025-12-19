import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import AccessoryCard from "@/components/accessory-card";
import CarCard from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import type { Accessory, CarInventory } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/shop/")({
	component: Shop,
});

function Shop() {
	const { data: carInventory, isLoading: isLoadingCars } = useQuery({
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/cars/inventory?limit=6`,
			);
			return (await res.json()) as CarInventory[];
		},
		queryKey: ["cars", "inventory"],
	});

	const { data: accessories, isLoading: isLoadingAccessories } = useQuery({
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

				{carInventory ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{carInventory.map((inv) => {
							return <CarCard inv={inv} key={`car-inv-${inv.id}`} />;
						})}
					</div>
				) : isLoadingCars ? (
					<Spinner />
				) : (
					<span className="font-medium text-4xl">Cars Not Found</span>
				)}
			</section>

			<section>
				<div className="mb-4 flex items-center gap-6">
					<h2 className="font-display font-semibold text-4xl">Accessories</h2>
					<Button asChild size="lg" variant="secondary">
						<Link to="/shop/accessories">See All</Link>
					</Button>
				</div>

				{accessories ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{accessories.map((accessory) => {
							return (
								<AccessoryCard
									accessory={accessory}
									key={`acc-${accessory.id}`}
								/>
							);
						})}
					</div>
				) : isLoadingAccessories ? (
					<Spinner />
				) : (
					<span className="font-medium text-4xl">Accessories Not Found</span>
				)}
			</section>
		</>
	);
}
