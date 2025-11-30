import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	stripSearchParams,
	useNavigate,
} from "@tanstack/react-router";
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
import type { CarInventory, CarMake } from "@/lib/types";
import { calculateRent, capitalize } from "@/lib/utils";

const COLORS = [
	"black",
	"blue",
	"dark grey",
	"dark slate blue",
	"green",
	"grey",
	"red",
	"silver",
	"white",
];

const defaultValues = {
	page: 0,
	sort: "best",
} as const;

const shopCarsSearchSchema = z.object({
	carClass: z.string().optional(),
	color: z.string().optional(),
	fuel: z.string().optional(),
	make: z.number().optional(),
	page: z.number().default(defaultValues.page),
	size: z.string().optional(),
	sort: z.string().default(defaultValues.sort),
	xwd: z.string().optional(),
});
type ShopCarsSearchSchema = z.infer<typeof shopCarsSearchSchema>;

export const Route = createFileRoute("/shop/cars/")({
	component: ShopCars,
	search: {
		middlewares: [stripSearchParams(defaultValues)],
	},
	validateSearch: shopCarsSearchSchema,
});

function ShopCars() {
	const { carClass, color, fuel, make, page, size, sort, xwd } =
		Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	// queries
	const { data, isLoading } = useQuery({
		queryFn: async () => {
			const params = new URLSearchParams({
				limit: "12",
				offset: `${(page ?? 0) * 12}`,
				...(carClass && { carClass }),
				...(color && { color }),
				...(fuel && { fuel }),
				...(make && { make: make.toString() }),
				...(size && { size }),
				...(xwd && { xwd }),
				...(sort && { sort }),
			});
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/cars/inventory?${params}`,
			);
			return (await res.json()) as CarInventory[];
		},
		queryKey: [
			"cars",
			"inventory",
			`page=${page ?? 0}`,
			`class=${carClass ?? "all"}`,
			`color=${color ?? "all"}`,
			`fuel=${fuel ?? "all"}`,
			`make=${make ?? "all"}`,
			`size=${size ?? "all"}`,
			`xwd=${xwd ?? "all"}`,
			`sort=${sort ?? "best"}`,
		],
	});

	const { data: manufacturers } = useQuery({
		queryFn: async () => {
			const res = await fetch(`${env.VITE_BACKEND_URL}/api/cars/manufacturers`);
			return (await res.json()) as CarMake[];
		},
		queryKey: ["cars", "manufacturers"],
		refetchOnWindowFocus: false,
	});

	// callbacks
	const search = useCallback(
		<T extends keyof Omit<ShopCarsSearchSchema, "page">>(
			key: T,
			value: Omit<ShopCarsSearchSchema, "page">[T] | "all",
		) => {
			navigate({
				search: {
					carClass,
					color,
					fuel,
					make,
					size,
					sort,
					xwd,
					[key]: value === "all" ? undefined : value,
				},
			});
		},
		[carClass, color, fuel, make, navigate, size, sort, xwd],
	);

	return (
		<>
			<ShopNav />
			<main className="flex flex-col gap-6 p-8">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Button
							onClick={() => navigate({ search: { page } })}
							size="icon"
							variant="secondary"
						>
							<RotateCcwIcon />
						</Button>
						<Select
							onValueChange={(v) =>
								search("make", v === "all" ? "all" : Number(v))
							}
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
										<SelectItem
											key={`make-${make.id}`}
											value={make.id.toString()}
										>
											{make.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select
							onValueChange={(v) => search("carClass", v)}
							value={carClass ?? "all"}
						>
							<SelectTrigger>
								{!carClass ? (
									<span className="text-muted-foreground">Class</span>
								) : (
									<SelectValue placeholder="Class" />
								)}
							</SelectTrigger>
							<SelectContent align="start">
								<SelectItem value="all">All</SelectItem>
								<SelectGroup>
									<SelectLabel>Vehicle Class</SelectLabel>
									<SelectItem value="hatchback">Hatchback</SelectItem>
									<SelectItem value="minivan">Minivan</SelectItem>
									<SelectItem value="sedan">Sedan</SelectItem>
									<SelectItem value="sports-car">Sports Car</SelectItem>
									<SelectItem value="suv">SUV</SelectItem>
									<SelectItem value="truck">Truck</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select
							onValueChange={(v) => search("fuel", v)}
							value={fuel ?? "all"}
						>
							<SelectTrigger>
								{!fuel ? (
									<span className="text-muted-foreground">Fuel</span>
								) : (
									<SelectValue placeholder="Fuel" />
								)}
							</SelectTrigger>
							<SelectContent align="start">
								<SelectItem value="all">All</SelectItem>
								<SelectGroup>
									<SelectLabel>Fuel Type</SelectLabel>
									<SelectItem value="gasoline">Gasoline</SelectItem>
									<SelectItem value="diesel">Diesel</SelectItem>
									<SelectItem value="electric">Electric</SelectItem>
									<SelectItem value="hybrid">Hybrid</SelectItem>
									<SelectItem value="phev">Plug-in Hybrid</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select
							onValueChange={(v) => search("size", v)}
							value={size ?? "all"}
						>
							<SelectTrigger>
								{!size ? (
									<span className="text-muted-foreground">Size</span>
								) : (
									<SelectValue placeholder="Size" />
								)}
							</SelectTrigger>
							<SelectContent align="start">
								<SelectItem value="all">All</SelectItem>
								<SelectGroup>
									<SelectLabel>Sizes</SelectLabel>
									<SelectItem value="compact">Compact</SelectItem>
									<SelectItem value="mid-size">Mid-size</SelectItem>
									<SelectItem value="large">Large</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select
							onValueChange={(v) => search("xwd", v)}
							value={xwd ?? "all"}
						>
							<SelectTrigger>
								{!xwd ? (
									<span className="text-muted-foreground">Drive</span>
								) : (
									<SelectValue placeholder="Drive" />
								)}
							</SelectTrigger>
							<SelectContent align="start">
								<SelectItem value="all">All</SelectItem>
								<SelectGroup>
									<SelectLabel>Drivetrain</SelectLabel>
									<SelectItem value="fwd">FWD</SelectItem>
									<SelectItem value="rwd">RWD</SelectItem>
									<SelectItem value="awd">AWD</SelectItem>
									<SelectItem value="4wd">4WD</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select
							onValueChange={(v) => search("color", v)}
							value={color ?? "all"}
						>
							<SelectTrigger>
								{!color ? (
									<span className="text-muted-foreground">Colour</span>
								) : (
									<SelectValue placeholder="Colour" />
								)}
							</SelectTrigger>
							<SelectContent align="start">
								<SelectItem value="all">All</SelectItem>
								<SelectGroup>
									<SelectLabel>Colours</SelectLabel>
									{COLORS.map((c) => (
										<SelectItem
											className="capitalize"
											key={`car-inv-${c}`}
											value={c}
										>
											<div
												className="mr-1 size-3 rounded-full border border-foreground/30"
												style={{
													backgroundColor: c.replaceAll(" ", ""),
												}}
											/>
											{capitalize(c)}
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
								<SelectLabel>Model</SelectLabel>
								<SelectItem value="model:asc">Model: A-Z</SelectItem>
								<SelectItem value="model:desc">Model: Z-A</SelectItem>
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Price</SelectLabel>
								<SelectItem value="price:asc">Price: Low to High</SelectItem>
								<SelectItem value="price:desc">Price: High to Low</SelectItem>
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Mileage</SelectLabel>
								<SelectItem value="mileage:asc">
									Mileage: Low to High
								</SelectItem>
								<SelectItem value="mileage:desc">
									Mileage: High to Low
								</SelectItem>
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Year</SelectLabel>
								<SelectItem value="year:desc">Year: Newest First</SelectItem>
								<SelectItem value="year:asc">Year: Oldest First</SelectItem>
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Fuel Economy</SelectLabel>
								<SelectItem value="fuelEcon:asc">
									Fuel Economy: Best First
								</SelectItem>
								<SelectItem value="fuelEcon:desc">
									Fuel Economy: Worst First
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				{data && data.length > 0 ? (
					<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{data.map((inv) => {
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
											/>
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
				) : isLoading ? (
					<Spinner />
				) : (
					<div className="mx-auto flex flex-col items-center gap-6 text-muted-foreground">
						<FrownIcon className="h-full w-[20vw]" />
						<span className="font-medium text-4xl">No Cars Found</span>
					</div>
				)}
				{data && data.length > 0 && (
					<div className="mx-auto flex items-center justify-center gap-2">
						<Button asChild={!!page} disabled={!page} variant="secondary">
							<Link
								search={{
									carClass,
									color,
									fuel,
									make,
									page: (page ?? 1) - 1,
									size,
									sort,
									xwd,
								}}
								to={Route.fullPath}
							>
								Back
							</Link>
						</Button>
						<Button
							asChild={!!data?.length && data.length >= 12}
							disabled={!data?.length || data.length < 12}
							variant="secondary"
						>
							<Link
								search={{
									carClass,
									color,
									fuel,
									make,
									page: (page ?? 0) + 1,
									size,
									sort,
									xwd,
								}}
								to={Route.fullPath}
							>
								Next
							</Link>
						</Button>
					</div>
				)}
			</main>
		</>
	);
}
