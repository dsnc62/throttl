import { useQuery } from "@tanstack/react-query";
import { RotateCcwIcon } from "lucide-react";
import z from "zod";
import { env } from "@/env";
import { capitalize } from "@/lib/utils";
import { Button } from "../ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

type AccessoriesFilterProps = {
	onReset?: () => void;
	onChange?: <T extends keyof Omit<ShopAccessoriesSearchSchema, "page">>(
		key: T,
		value: Omit<ShopAccessoriesSearchSchema, "page">[T] | "all",
	) => void;
	values: Omit<ShopAccessoriesSearchSchema, "page">;
};

const CATEGORIES = [
	"air fresheners",
	"cleaning",
	"dashcams",
	"exterior protection",
	"mats",
];

export const defaultValues = {
	page: 0,
	sort: "best",
} as const;

export const shopAccessoriesSearchSchema = z.object({
	car: z.number().optional(),
	category: z.string().optional(),
	make: z.string().optional(),
	page: z.number().default(defaultValues.page),
	sort: z.string().default(defaultValues.sort),
});
export type ShopAccessoriesSearchSchema = z.infer<
	typeof shopAccessoriesSearchSchema
>;

export default function AccessoriesFilter(props: AccessoriesFilterProps) {
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

	return (
		<div className="flex items-center justify-between gap-4">
			<div className="flex items-center gap-2">
				<Button onClick={props.onReset} size="icon" variant="secondary">
					<RotateCcwIcon />
				</Button>
				<Select
					onValueChange={(v) => props.onChange?.("category", v)}
					value={props.values.category?.toString() ?? "all"}
				>
					<SelectTrigger>
						{!props.values.category ? (
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
						props.onChange?.("car", v === "all" ? "all" : Number(v))
					}
					value={props.values.car?.toString() ?? "all"}
				>
					<SelectTrigger>
						{!props.values.car ? (
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
					onValueChange={(v) => props.onChange?.("make", v)}
					value={props.values.make?.toString() ?? "all"}
				>
					<SelectTrigger>
						{!props.values.make ? (
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

			<Select
				onValueChange={(v) => props.onChange?.("sort", v)}
				value={props.values.sort}
			>
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
	);
}
