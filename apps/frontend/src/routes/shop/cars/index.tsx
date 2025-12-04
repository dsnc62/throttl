import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	stripSearchParams,
	useNavigate,
} from "@tanstack/react-router";
import { FrownIcon } from "lucide-react";
import { useCallback } from "react";
import CarCard from "@/components/car-card";
import CarsFilter, {
	type CarsSearchSchema,
	carsSearchSchema,
	defaultValues,
} from "@/components/filters/cars";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";
import type { CarInventory } from "@/lib/types";

export const Route = createFileRoute("/shop/cars/")({
	component: ShopCars,
	search: {
		middlewares: [stripSearchParams(defaultValues)],
	},
	validateSearch: carsSearchSchema,
});

function ShopCars() {
	const {
		carClass,
		color,
		fuel,
		make,
		page,
		purchasable,
		rentable,
		size,
		sort,
		xwd,
	} = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	// queries
	const { data, isLoading } = useQuery({
		queryFn: async () => {
			const params = new URLSearchParams({
				limit: "12",
				offset: `${(page ?? 0) * 12}`,
				purchasable: purchasable.toString(),
				rentable: rentable.toString(),
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
			purchasable,
			rentable,
			`class=${carClass ?? "all"}`,
			`color=${color ?? "all"}`,
			`fuel=${fuel ?? "all"}`,
			`make=${make ?? "all"}`,
			`size=${size ?? "all"}`,
			`xwd=${xwd ?? "all"}`,
			`sort=${sort ?? "best"}`,
		],
	});

	// callbacks
	const search = useCallback(
		<T extends keyof Omit<CarsSearchSchema, "page">>(
			key: T,
			value: Omit<CarsSearchSchema, "page">[T] | "all",
		) => {
			navigate({
				search: {
					carClass,
					color,
					fuel,
					make,
					purchasable,
					rentable,
					size,
					sort,
					xwd,
					[key]: value === "all" ? undefined : value,
				},
			});
		},
		[
			carClass,
			color,
			fuel,
			make,
			purchasable,
			rentable,
			navigate,
			size,
			sort,
			xwd,
		],
	);

	return (
		<>
			<CarsFilter
				onChange={search}
				onReset={() => navigate({})}
				values={{
					carClass,
					color,
					fuel,
					make,
					purchasable,
					rentable,
					size,
					sort,
					xwd,
				}}
			/>

			{data && data.length > 0 ? (
				<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
					{data.map((inv) => {
						return <CarCard inv={inv} key={`car-inv-${inv.id}`} />;
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
								purchasable,
								rentable,
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
								purchasable,
								rentable,
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
		</>
	);
}
