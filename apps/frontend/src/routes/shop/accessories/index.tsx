import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	stripSearchParams,
	useNavigate,
} from "@tanstack/react-router";
import { FrownIcon } from "lucide-react";
import { useCallback } from "react";
import AccessoryCard from "@/components/accessory-card";
import AccessoriesFilter, {
	type AccessoriesSearchSchema,
	accessoriesSearchSchema,
	defaultValues,
} from "@/components/filters/accessories";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";
import type { Accessory } from "@/lib/types";

export const Route = createFileRoute("/shop/accessories/")({
	component: ShopAccessories,
	search: {
		middlewares: [stripSearchParams(defaultValues)],
	},
	validateSearch: accessoriesSearchSchema,
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

	// callbacks
	const search = useCallback(
		<T extends keyof Omit<AccessoriesSearchSchema, "page">>(
			key: T,
			value: Omit<AccessoriesSearchSchema, "page">[T] | "all",
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
			<AccessoriesFilter
				onChange={search}
				onReset={() => navigate({})}
				values={{
					car,
					category,
					make,
					sort,
				}}
			/>
			{data && data.length > 0 ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{data.map((accessory) => {
						return (
							<AccessoryCard
								accessory={accessory}
								key={`acc-${accessory.id}`}
							/>
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
						<Link
							search={{
								car,
								category,
								make,
								page: (page ?? 1) - 1,
							}}
							to={Route.fullPath}
						>
							Back
						</Link>
					</Button>
					<Button
						asChild={!!data?.length && data.length > 12}
						disabled={!data?.length || data.length < 12}
						variant="secondary"
					>
						<Link
							search={{
								car,
								category,
								make,
								page: (page ?? 0) + 1,
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
