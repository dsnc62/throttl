import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FrownIcon, RotateCcwIcon } from "lucide-react";
import { useCallback } from "react";
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";
import type { Accessory } from "@/lib/types";
import { capitalize } from "@/lib/utils";

const CATEGORIES = [
	"air fresheners",
	"cleaning",
	"dashcams",
	"exterior protection",
	"mats",
];

const shopAccessoriesSearchSchema = z.object({
	car: z.number().optional(),
	category: z.string().optional(),
	make: z.string().optional(),
	page: z.number().default(0),
	sort: z.string().default("best"),
});
type ShopAccessoriesSearchSchema = z.infer<typeof shopAccessoriesSearchSchema>;

export const Route = createFileRoute("/shop/accessories/")({
	component: ShopAccessories,
	validateSearch: shopAccessoriesSearchSchema,
});

function ShopAccessories() {
	// navigation
	const { car, category, make, page, sort } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	// queries
	const { data, isLoading } = useQuery({
		queryFn: async () => {
			const params = new URLSearchParams({
				limit: "12",
				offset: `${(page ?? 0) * 12}`,
				...(car && { car: car.toString() }),
				...(category && { category }),
				...(make && { make }),
				...(sort && { sort }),
			});
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/accessories?${params}`,
			);
			return (await res.json()) as Accessory[];
		},
		queryKey: [
			"accessories",
			`page=${page ?? 0}`,
			`car=${car ?? "all"}`,
			`category=${category ?? "all"}`,
			`make=${make ?? "all"}`,
			`sort=${sort}`,
		],
	});

	const { data: manufacturers } = useQuery({
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/accessories/manufacturers`,
			);
			return (await res.json()) as string[];
		},
		queryKey: ["accessories", "manufacturers"],
		refetchOnWindowFocus: false,
	});

	const { data: cars } = useQuery({
		queryFn: async () => {
			const res = await fetch(`${env.VITE_BACKEND_URL}/api/accessories/cars`);
			return (await res.json()) as {
				[make: string]: {
					id: number;
					model: string;
				}[];
			};
		},
		queryKey: ["accessories", "cars"],
		refetchOnWindowFocus: false,
	});

	// callbacks
	const search = useCallback(
		<T extends keyof Omit<ShopAccessoriesSearchSchema, "page">>(
			key: T,
			value: Omit<ShopAccessoriesSearchSchema, "page">[T] | "all",
		) => {
			navigate({
				search: {
					car,
					category,
					make,
					[key]: value === "all" ? undefined : value,
				},
			});
		},
		[car, category, make, navigate],
	);

	return (
		<>
			<ShopNav />
			<main className="flex flex-col gap-6 p-8">
				<div className="flex items-center justify-between gap-4">
					<div className="flex gap-2">
						<Button
							onClick={() => navigate({ search: { page } })}
							size="icon"
							variant="secondary"
						>
							<RotateCcwIcon />
						</Button>
						<Select
							onValueChange={(v) => search("category", v)}
							value={category?.toString() ?? "all"}
						>
							<SelectTrigger>
								{!category ? (
									<span className="text-muted-foreground">Category</span>
								) : (
									<SelectValue placeholder="Category" />
								)}
							</SelectTrigger>
							<SelectContent align="start">
								<SelectItem value="all">All</SelectItem>
								<SelectGroup>
									<SelectLabel>Categories</SelectLabel>
									{CATEGORIES?.map((cat) => (
										<SelectItem key={`accessory-${cat}`} value={cat}>
											{capitalize(cat)}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select
							onValueChange={(v) =>
								search("car", v === "all" ? "all" : Number(v))
							}
							value={car?.toString() ?? "all"}
						>
							<SelectTrigger>
								{!car ? (
									<span className="text-muted-foreground">Car</span>
								) : (
									<SelectValue placeholder="Car" />
								)}
							</SelectTrigger>
							<SelectContent align="start" className="max-h-[62vh]">
								<SelectItem value="all">All</SelectItem>
								{Object.keys(cars ?? {})
									.sort()
									.map((k) => (
										<SelectGroup key={`accessory-${k}`}>
											<SelectLabel>{k}</SelectLabel>
											{cars?.[k].map((c) => (
												<SelectItem
													key={`accessory-${k}-${c.id}`}
													value={c.id.toString()}
												>
													{c.model}
												</SelectItem>
											))}
										</SelectGroup>
									))}
							</SelectContent>
						</Select>
						<Select
							onValueChange={(v) => search("make", v)}
							value={make?.toString() ?? "all"}
						>
							<SelectTrigger>
								{!make ? (
									<span className="text-muted-foreground">Make</span>
								) : (
									<SelectValue placeholder="Make" />
								)}
							</SelectTrigger>
							<SelectContent align="start">
								<SelectItem value="all">All</SelectItem>
								<SelectGroup>
									<SelectLabel>Manufacturers</SelectLabel>
									{manufacturers?.map((make) => (
										<SelectItem key={`make-${make}`} value={make}>
											{make}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<Select onValueChange={(v) => search("sort", v)} value={sort}>
						<SelectTrigger>
							<SelectValue placeholder="Sort" />
						</SelectTrigger>
						<SelectContent align="end">
							<SelectItem value="best">Best Match</SelectItem>
							<SelectGroup>
								<SelectLabel>Name</SelectLabel>
								<SelectItem value="name:asc">Name: A-Z</SelectItem>
								<SelectItem value="name:desc">Name: Z-A</SelectItem>
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Price</SelectLabel>
								<SelectItem value="price:asc">Price: Low to High</SelectItem>
								<SelectItem value="price:desc">Price: High to Low</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				{data && data.length > 0 ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{data.map((accessory) => {
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
				) : isLoading ? (
					<Spinner />
				) : (
					<div className="mx-auto flex flex-col items-center gap-6 text-muted-foreground">
						<FrownIcon className="h-full w-[20vw]" />
						<span className="font-medium text-4xl">No Accessories Found</span>
					</div>
				)}

				{data && data.length > 0 && (
					<div className="mx-auto flex items-center justify-center gap-2">
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
				)}
			</main>
		</>
	);
}
