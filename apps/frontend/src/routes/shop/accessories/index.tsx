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
import type { Accessory } from "@/lib/types";

const shopAccessoriesSearchSchema = z.object({
	page: z.number().optional(),
});

export const Route = createFileRoute("/shop/accessories/")({
	component: ShopAccessories,
	validateSearch: shopAccessoriesSearchSchema,
});

function ShopAccessories() {
	const { page } = Route.useSearch();

	const { data } = useQuery({
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/accessories?limit=12&offset=${(page ?? 0) * 12}`,
			);
			return (await res.json()) as Accessory[];
		},
		queryKey: ["accessories", `page=${page ?? 0}`],
	});

	return (
		<>
			<ShopNav />
			<main className="flex flex-col gap-6 p-8">
				<section>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{data?.map((accessory) => {
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
					<div className="mx-auto mt-4 flex items-center justify-center gap-2">
						<Button asChild={!!page} disabled={!page} variant="secondary">
							<Link search={{ page: (page ?? 1) - 1 }} to="/shop/accessories">
								Back
							</Link>
						</Button>
						<Button
							asChild={!!data?.length && data.length > 12}
							disabled={!data?.length || data.length < 12}
							variant="secondary"
						>
							<Link search={{ page: (page ?? 0) + 1 }} to="/shop/accessories">
								Next
							</Link>
						</Button>
					</div>
				</section>
			</main>
		</>
	);
}
