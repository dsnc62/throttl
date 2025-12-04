import { useQuery } from "@tanstack/react-query";
import { CheckIcon, RotateCcwIcon, XIcon } from "lucide-react";
import z from "zod";
import { env } from "@/env";
import type { CarMake } from "@/lib/types";
import { capitalize, cn } from "@/lib/utils";
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

type CarsFilterProps = {
	onReset?: () => void;
	onChange?: <T extends keyof Omit<CarsSearchSchema, "page">>(
		key: T,
		value: Omit<CarsSearchSchema, "page">[T] | "all",
	) => void;
	values: Omit<CarsSearchSchema, "page">;
};

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

export const defaultValues = {
	page: 0,
	purchasable: true,
	rentable: true,
	sort: "best",
} as const;

export const carsSearchSchema = z.object({
	carClass: z.string().optional(),
	color: z.string().optional(),
	fuel: z.string().optional(),
	make: z.number().optional(),
	page: z.number().default(defaultValues.page),
	purchasable: z.boolean().default(defaultValues.purchasable),
	rentable: z.boolean().default(defaultValues.rentable),
	size: z.string().optional(),
	sort: z.string().default(defaultValues.sort),
	xwd: z.string().optional(),
});
export type CarsSearchSchema = z.infer<typeof carsSearchSchema>;

export default function CarsFilter(props: CarsFilterProps) {
	const { data: manufacturers } = useQuery({
		queryFn: async () => {
			const res = await fetch(`${env.VITE_BACKEND_URL}/api/cars/manufacturers`);
			return (await res.json()) as CarMake[];
		},
		queryKey: ["cars", "manufacturers"],
		refetchOnWindowFocus: false,
	});

	return (
		<div className="flex items-center justify-between gap-4">
			<div className="flex items-center gap-2">
				<Button onClick={props.onReset} size="icon" variant="secondary">
					<RotateCcwIcon />
				</Button>
				<Select
					onValueChange={(v) =>
						props.onChange?.("make", v === "all" ? "all" : Number(v))
					}
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
								<SelectItem key={`make-${make.id}`} value={make.id.toString()}>
									{make.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
				<Select
					onValueChange={(v) => props.onChange?.("carClass", v)}
					value={props.values.carClass ?? "all"}
				>
					<SelectTrigger>
						{!props.values.carClass ? (
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
					onValueChange={(v) => props.onChange?.("fuel", v)}
					value={props.values.fuel ?? "all"}
				>
					<SelectTrigger>
						{!props.values.fuel ? (
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
					onValueChange={(v) => props.onChange?.("size", v)}
					value={props.values.size ?? "all"}
				>
					<SelectTrigger>
						{!props.values.size ? (
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
					onValueChange={(v) => props.onChange?.("xwd", v)}
					value={props.values.xwd ?? "all"}
				>
					<SelectTrigger>
						{!props.values.xwd ? (
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
					onValueChange={(v) => props.onChange?.("color", v)}
					value={props.values.color ?? "all"}
				>
					<SelectTrigger>
						{!props.values.color ? (
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
				<Button
					onClick={() =>
						props.onChange?.("purchasable", !props.values.purchasable)
					}
					variant={props.values.purchasable ? "default" : "outline"}
				>
					<div className="relative size-4">
						<XIcon
							className={cn(
								"absolute top-0 left-0 transition-transform",
								!props.values.purchasable ? "scale-100" : "scale-0",
							)}
						/>
						<CheckIcon
							className={cn(
								"absolute top-0 left-0 transition-transform",
								props.values.purchasable ? "scale-100" : "scale-0",
							)}
						/>
					</div>
					Purchasable
				</Button>
				<Button
					onClick={() => props.onChange?.("rentable", !props.values.rentable)}
					variant={props.values.rentable ? "default" : "outline"}
				>
					<div className="relative size-4">
						<XIcon
							className={cn(
								"absolute top-0 left-0 transition-transform",
								!props.values.rentable ? "scale-100" : "scale-0",
							)}
						/>
						<CheckIcon
							className={cn(
								"absolute top-0 left-0 transition-transform",
								props.values.rentable ? "scale-100" : "scale-0",
							)}
						/>
					</div>
					Rentable
				</Button>
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
						<SelectItem value="mileage:asc">Mileage: Low to High</SelectItem>
						<SelectItem value="mileage:desc">Mileage: High to Low</SelectItem>
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
	);
}
