import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	stripSearchParams,
	useNavigate,
} from "@tanstack/react-router";
import { ChevronLeftIcon, FrownIcon, ShoppingCartIcon } from "lucide-react";
import { z } from "zod";
import StatCard from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";
import type { Accessory, Car } from "@/lib/types";
import { capitalize } from "@/lib/utils";

const cadFormatter = Intl.NumberFormat("en-CA", {
	currency: "CAD",
	style: "currency",
});

const shopAccessoriesInfoSearchSchema = z.object({
	id: z.number(),
	qty: z.number().default(1),
});

export const Route = createFileRoute("/shop/accessories/info")({
	component: ShopAccessoriesInfo,
	search: {
		middlewares: [stripSearchParams({ qty: 1 })],
	},
	validateSearch: shopAccessoriesInfoSearchSchema,
});

function ShopAccessoriesInfo() {
	const { id, qty } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	// queries
	const { data, isLoading } = useQuery({
		enabled: !!id,
		queryFn: async () => {
			const res = await fetch(`${env.VITE_BACKEND_URL}/api/accessories/${id}`);

			return (await res.json()) as Accessory;
		},
		queryKey: ["accessories", "info", id],
	});

	const { data: compatibility } = useQuery({
		enabled: !!id && !!data && !data.universal,
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/accessories/cars/${id}`,
			);

			return (await res.json()) as {
				accessory: number;
				car: Pick<Car, "id" | "model" | "make">;
			};
		},
		queryKey: ["accessories", "cars", id],
	});

	// render
	if (isLoading) {
		return (
			<Spinner className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2" />
		);
	}

	if (!data) {
		return (
			<div className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 flex flex-col items-center justify-center gap-4">
				<FrownIcon className="h-[20vh] w-full" />
				<span className="font-medium text-4xl">Accessory Not Found</span>
				<Button asChild variant="outline">
					<Link to="/shop/accessories">
						<ChevronLeftIcon /> Back
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex gap-6">
			<section className="flex-3">
				<h1 className="font-display font-semibold text-5xl">{data.name}</h1>
				<p className="mb-3 text-2xl italic opacity-80">by {data.make}</p>
				<div className="mb-6 aspect-video w-full rounded-xl bg-secondary" />

				<div className="grid grid-cols-3 gap-3">
					<StatCard title="Category" value={capitalize(data.category)} />
					<StatCard title="Manufacturer" value={capitalize(data.make)} />
					<StatCard
						title="Compatibility"
						value={
							data.universal
								? "Universal"
								: compatibility
									? `${compatibility.car.make.name} ${compatibility.car.model}`
									: "Unknown"
						}
					/>
				</div>
			</section>
			<section className="flex h-fit flex-2 flex-col gap-3 rounded-xl border bg-card p-4">
				<div className="border-b pt-1 pb-3">
					<h2 className="font-display font-semibold text-3xl">
						{cadFormatter.format(data.price)}
					</h2>
					<span className="text-muted-foreground">
						{data.inventories.length} in stock
					</span>
				</div>

				<div className="flex items-center gap-3">
					<Button className="flex-1" disabled={data.inventories.length === 0}>
						{data.inventories.length > 0 ? (
							<>
								<ShoppingCartIcon />
								Add to Cart
							</>
						) : (
							"Sold Out"
						)}
					</Button>
					<Select
						disabled={data.inventories.length === 0}
						onValueChange={(v) => navigate({ search: { id, qty: Number(v) } })}
						value={qty.toString()}
					>
						<SelectTrigger className="w-20">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Array.from(
								{ length: Math.min(10, data.inventories.length) },
								(_, i) => (
									<SelectItem
										key={`item-qty-${i + 1}`}
										value={(i + 1).toString()}
									>
										{i + 1}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</div>
			</section>
		</div>
	);
}
