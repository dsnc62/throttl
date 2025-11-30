import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	stripSearchParams,
	useNavigate,
} from "@tanstack/react-router";
import { addDays, differenceInDays } from "date-fns";
import { ChevronLeftIcon, FrownIcon, ShoppingCartIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { DateTimePicker } from "@/components/date-time-picker";
import StatCard from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import type { CarInventory } from "@/lib/types";
import {
	calcDepreciatedValue,
	calcLoanPayments,
	calculateRent,
	capitalize,
} from "@/lib/utils";

const DEFAULT_FINANCE_RATE = 5.99;
const DEFAULT_LEASE_RATE = 6.69;
const FEES = 1860 + 100 + 22 + 1.08 + 22.5; // dest + ac + omvic + env handling fee + tire levy
const LEASE_TERMS = [24, 28, 36, 40, 48, 52, 60, 64] as const;
const FINANCE_TERMS = [36, 48, 60, 72, 84] as const;

const cadFormatter = Intl.NumberFormat("en-CA", {
	currency: "CAD",
	style: "currency",
});

const today = new Date();
today.setHours(10, 30, 0, 0);

const defaultValues = {
	endDate: addDays(today, 1).toISOString(),
	startDate: today.toISOString(),
};

const shopCarsInfoSearchSchema = z.object({
	annualkm: z.number().optional(),
	endDate: z.iso.datetime().default(defaultValues.endDate),
	freq: z.enum(["weekly", "bi-weekly", "monthly"] as const).optional(),
	id: z.string(),
	rate: z.number().optional(),
	startDate: z.iso.datetime().default(defaultValues.startDate),
	tab: z.enum(["lease", "finance", "cash", "rent"] as const).optional(),
	term: z.number().optional(),
});
type ShopCarsInfoSearchSchema = z.infer<typeof shopCarsInfoSearchSchema>;

export const Route = createFileRoute("/shop/cars/info")({
	component: ShopCarsInfo,
	search: {
		middlewares: [stripSearchParams(defaultValues)],
	},
	validateSearch: shopCarsInfoSearchSchema,
});

function ShopCarsInfo() {
	const { annualkm, endDate, freq, id, rate, startDate, tab, term } =
		Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	// queries
	const { data, isLoading } = useQuery({
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/cars/inventory/${id}`,
			);

			return (await res.json()) as CarInventory;
		},
		queryKey: ["cars", "inventory", id],
	});

	// states
	const [rateType, setRateType] = useState<"default" | "custom">(() => {
		if (!rate) return "default";

		if (rate === DEFAULT_LEASE_RATE && (!tab || tab === "lease")) {
			return "default";
		}

		if (rate === DEFAULT_FINANCE_RATE && tab === "finance") {
			return "default";
		}

		return "custom";
	});

	// derived
	const rentPrice = useMemo(() => {
		if (!data) return 0;

		return calculateRent(
			data.trim.price,
			differenceInDays(endDate, startDate),
			data.trim.car.estLifespanKM,
		);
	}, [data, endDate, startDate]);

	const totalPrice = useMemo(() => {
		if (!data) return 0;

		const actualPrice = calcDepreciatedValue(
			data.trim.price,
			Math.max(0, today.getFullYear() - data.trim.car.year),
			data.mileage,
		);
		return (actualPrice + FEES) * 1.13;
	}, [data]);

	const financeTerm = useMemo(() => {
		const defaultTerm = FINANCE_TERMS[FINANCE_TERMS.length - 2];
		return term
			? (FINANCE_TERMS.find((t) => t === term) ?? defaultTerm)
			: defaultTerm;
	}, [term]);

	const financePrice = useMemo(() => {
		if (tab !== "finance") {
			return 0;
		}

		const loan = calcLoanPayments(
			totalPrice,
			rate ?? DEFAULT_FINANCE_RATE,
			financeTerm / 12,
		);

		return loan[freq ?? "weekly"];
	}, [financeTerm, freq, rate, tab, totalPrice]);

	const leaseTerm = useMemo(() => {
		const defaultTerm = LEASE_TERMS[LEASE_TERMS.length - 2];
		return term
			? (LEASE_TERMS.find((t) => t === term) ?? defaultTerm)
			: defaultTerm;
	}, [term]);

	const leasePrice = useMemo(() => {
		if (!!tab && tab !== "lease") {
			return 0;
		}

		const age = leaseTerm / 12;
		const depreciation = calcDepreciatedValue(
			totalPrice,
			age,
			(annualkm ?? 20000) * age,
		);
		const ratio = depreciation / totalPrice; // add a depreciation factor to the price

		const pricePerKM = totalPrice / (data?.trim.car.estLifespanKM ?? 1); // take off 5% of value because $$$
		const price = pricePerKM * (1 + ratio) * (annualkm ?? 20000) * age; // estimated multiplier based on similar Camry on Toyota's site

		const loan = calcLoanPayments(
			price,
			rate ?? DEFAULT_LEASE_RATE,
			leaseTerm / 12,
		);

		return loan[freq ?? "weekly"];
	}, [
		annualkm,
		data?.trim.car.estLifespanKM,
		freq,
		leaseTerm,
		tab,
		totalPrice,
		rate,
	]);

	// callbacks
	const search = useCallback(
		<T extends keyof Omit<ShopCarsInfoSearchSchema, "id">>(
			key: T,
			value: Omit<ShopCarsInfoSearchSchema, "id">[T],
		) => {
			navigate({
				search: {
					endDate,
					freq,
					id,
					rate,
					startDate,
					tab,
					term,
					[key]: value,
				},
			});
		},
		[endDate, freq, id, navigate, rate, startDate, tab, term],
	);

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
				<span className="font-medium text-4xl">Car Not Found</span>
				<Button asChild variant="outline">
					<Link to="/shop/cars">
						<ChevronLeftIcon /> Back
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex gap-6">
			<section className="@container/car-details flex-3">
				<h1 className="font-display font-semibold text-5xl">
					{data.trim.car.model} {data.trim.name}
				</h1>
				<p className="mb-3 text-2xl italic opacity-80">
					{data.trim.car.tagline}
				</p>
				<div className="mb-6 aspect-video w-full rounded-xl bg-secondary" />

				<div className="grid @2xl:grid-cols-4 @lg:grid-cols-3 grid-cols-2 gap-3">
					<StatCard title="Year" value={data.trim.car.year} />
					<StatCard title="Make" value={data.trim.car.make.name} />
					<StatCard title="Colour" value={capitalize(data.color)} />
					<StatCard title="Class" value={capitalize(data.trim.car.class)} />
					<StatCard
						title="Size"
						value={capitalize(data.trim.car.size ?? "N/A")}
					/>
					<StatCard title="Seats" value={data.trim.car.seats} />
					<StatCard title="Fuel" value={capitalize(data.trim.fuel)} />
					<StatCard
						title="Fuel Economy"
						value={`${data.trim.fuelEcon}L/100KM`}
					/>
					<StatCard
						title="Transmission"
						value={capitalize(data.trim.transmission)}
					/>
					<StatCard title="Drivetrain" value={data.trim.xwd.toUpperCase()} />
					<StatCard
						title="Country"
						value={capitalize(data.trim.car.make.country)}
					/>
					<StatCard title="Mileage" value={`${data.mileage}KM`} />
				</div>
			</section>
			<section className="h-fit min-w-80 flex-2 shrink-0 rounded-xl border bg-card p-4">
				<Tabs
					defaultValue={
						data.purchasable
							? tab !== "rent"
								? (tab ?? "lease")
								: "lease"
							: "rent"
					}
					onValueChange={(v) =>
						navigate({
							search: { id, tab: v as "lease" | "finance" | "cash" | "rent" },
						})
					}
				>
					<TabsList className="w-full">
						{data.purchasable && (
							<>
								<TabsTrigger value="lease">Lease</TabsTrigger>
								<TabsTrigger value="finance">Finance</TabsTrigger>
								<TabsTrigger value="cash">Cash</TabsTrigger>
							</>
						)}
						{data.rentable && <TabsTrigger value="rent">Rent</TabsTrigger>}
					</TabsList>
					<TabsContent className="flex flex-col gap-3" value="lease">
						<div className="border-b py-3">
							<h2 className="font-display font-semibold text-3xl">
								{cadFormatter.format(leasePrice)}/{freq ?? "weekly"}
							</h2>
							<span className="text-muted-foreground">
								for {leaseTerm} mo. (incl. fees & taxes)
							</span>
						</div>
						<div>
							<h3 className="mb-2 text-lg">Payment Frequency</h3>
							<RadioGroup
								className="flex"
								defaultValue="weekly"
								onValueChange={(v) =>
									search("freq", v as "weekly" | "bi-weekly" | "monthly")
								}
							>
								<div className="flex items-center gap-3">
									<RadioGroupItem id="monthly-lease" value="monthly" />
									<Label htmlFor="monthly-lease">Monthly</Label>
								</div>
								<div className="flex items-center gap-3">
									<RadioGroupItem id="biweekly-lease" value="bi-weekly" />
									<Label htmlFor="biweekly-lease">Bi-Weekly</Label>
								</div>
								<div className="flex items-center gap-3">
									<RadioGroupItem id="weekly-lease" value="weekly" />
									<Label htmlFor="weekly-lease">Weekly</Label>
								</div>
							</RadioGroup>
						</div>
						<Separator />
						<div className="grid grid-cols-2 gap-3">
							<div>
								<h3 className="mb-2 text-lg">Term</h3>
								<Select
									defaultValue={leaseTerm.toString()}
									key={tab}
									onValueChange={(v) => search("term", Number(v))}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent align="start">
										{LEASE_TERMS.map((t) => (
											<SelectItem key={`lease-term-${t}`} value={t.toString()}>
												{t} months
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<h3 className="mb-2 text-lg">Rate</h3>
								{rateType === "default" ? (
									<h4 className="mt-3 mb-1 font-medium text-xl">
										{DEFAULT_LEASE_RATE}%
									</h4>
								) : (
									<Input
										className="mb-2"
										defaultValue={rate ?? DEFAULT_LEASE_RATE}
										onBlur={(ev) => {
											const val = Number(ev.currentTarget.value);
											if (Number.isNaN(val)) {
												return;
											}

											search("rate", val);
										}}
										type="number"
									/>
								)}
								<RadioGroup
									className="flex"
									onValueChange={(v) => {
										setRateType(v as "default" | "custom");
										search("rate", DEFAULT_LEASE_RATE);
									}}
									value={rateType}
								>
									<div className="flex items-center gap-3">
										<RadioGroupItem id="default-lease-rate" value="default" />
										<Label htmlFor="default-lease-rate">Default</Label>
									</div>
									<div className="flex items-center gap-3">
										<RadioGroupItem id="custom-lease-rate" value="custom" />
										<Label htmlFor="custom-lease-rate">Custom</Label>
									</div>
								</RadioGroup>
							</div>
						</div>
						<Separator />
						<div className="grid grid-cols-2 gap-3">
							<div>
								<h3 className="mb-2 text-lg">Annual KM</h3>
								<Select
									defaultValue={calcKmValue(annualkm)[0]}
									onValueChange={(v) => search("annualkm", Number(v) * 1000)}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent align="start">
										<SelectItem value="16">16,000 KM</SelectItem>
										<SelectItem value="20">20,000 KM</SelectItem>
										<SelectItem value="24">24,000 KM</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<h3 className="mb-2 text-lg">Additional KM</h3>
								<Input
									defaultValue={calcKmValue(annualkm)[1]}
									onBlur={(ev) => {
										const val = Number(ev.currentTarget.value);
										if (Number.isNaN(val)) {
											return;
										}

										const km = Number(calcKmValue(annualkm)[0]) * 1000 + val;
										search("annualkm", km);
									}}
									type="number"
								/>
							</div>
						</div>
						<Separator />
						<Button>
							<ShoppingCartIcon />
							Order
						</Button>
					</TabsContent>
					<TabsContent className="flex flex-col gap-3" value="finance">
						<div className="border-b py-3">
							<h2 className="font-display font-semibold text-3xl">
								{cadFormatter.format(financePrice)}/{freq ?? "weekly"}
							</h2>
							<span className="text-muted-foreground">
								for {financeTerm} mo. (incl. fees & taxes)
							</span>
						</div>
						<div>
							<h3 className="mb-2 text-lg">Payment Frequency</h3>
							<RadioGroup
								className="flex"
								defaultValue="weekly"
								onValueChange={(v) =>
									search("freq", v as "weekly" | "bi-weekly" | "monthly")
								}
							>
								<div className="flex items-center gap-3">
									<RadioGroupItem id="monthly-finance" value="monthly" />
									<Label htmlFor="monthly-finance">Monthly</Label>
								</div>
								<div className="flex items-center gap-3">
									<RadioGroupItem id="biweekly-finance" value="bi-weekly" />
									<Label htmlFor="biweekly-finance">Bi-Weekly</Label>
								</div>
								<div className="flex items-center gap-3">
									<RadioGroupItem id="weekly-finance" value="weekly" />
									<Label htmlFor="weekly-finance">Weekly</Label>
								</div>
							</RadioGroup>
						</div>
						<Separator />
						<div className="grid grid-cols-2 gap-3">
							<div>
								<h3 className="mb-2 text-lg">Term</h3>
								<Select
									defaultValue={financeTerm.toString()}
									key={tab}
									onValueChange={(v) => search("term", Number(v))}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent align="start">
										{FINANCE_TERMS.map((t) => (
											<SelectItem
												key={`finance-term-${t}`}
												value={t.toString()}
											>
												{t} months
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<h3 className="mb-2 text-lg">Rate</h3>
								{rateType === "default" ? (
									<h4 className="mt-3 mb-1 font-medium text-xl">
										{DEFAULT_FINANCE_RATE}%
									</h4>
								) : (
									<Input
										className="mb-2"
										defaultValue={rate ?? DEFAULT_FINANCE_RATE}
										onBlur={(ev) => {
											const val = Number(ev.currentTarget.value);
											if (Number.isNaN(val)) {
												return;
											}

											search("rate", val);
										}}
										type="number"
									/>
								)}
								<RadioGroup
									className="flex"
									onValueChange={(v) => {
										setRateType(v as "default" | "custom");
										search("rate", DEFAULT_FINANCE_RATE);
									}}
									value={rateType}
								>
									<div className="flex items-center gap-3">
										<RadioGroupItem id="default-finance-rate" value="default" />
										<Label htmlFor="default-finance-rate">Default</Label>
									</div>
									<div className="flex items-center gap-3">
										<RadioGroupItem id="custom-finance-rate" value="custom" />
										<Label htmlFor="custom-finance-rate">Custom</Label>
									</div>
								</RadioGroup>
							</div>
						</div>
						<Separator />
						<Button>
							<ShoppingCartIcon />
							Order
						</Button>
					</TabsContent>
					<TabsContent className="flex flex-col gap-3" value="cash">
						<div className="border-b py-3">
							<h2 className="font-display font-semibold text-3xl">
								{cadFormatter.format(totalPrice)}
							</h2>
							<span className="text-muted-foreground">
								Includes Fees and Taxes
							</span>
						</div>
						<Button>
							<ShoppingCartIcon />
							Order
						</Button>
					</TabsContent>
					<TabsContent className="flex flex-col gap-3" value="rent">
						<div className="border-b py-3">
							<h2 className="font-display font-semibold text-3xl">
								{cadFormatter.format(rentPrice)}
							</h2>
							<span className="text-muted-foreground">
								for {differenceInDays(endDate, startDate)} day (incl. taxes)
							</span>
						</div>
						<div>
							<h3 className="mb-2 text-lg">Dates</h3>
							<DateTimePicker
								dateLabel="Pick Up Date"
								defaultValue={new Date(startDate)}
								minDate={today}
								onChange={(d) => {
									search("startDate", (d ?? today).toISOString());
								}}
								timeLabel="Pick Up Time"
							/>
							<div className="mb-3" />
							<DateTimePicker
								dateLabel="Return Date"
								defaultValue={new Date(endDate)}
								minDate={new Date(startDate)}
								onChange={(d) => {
									search("endDate", (d ?? addDays(today, 1)).toISOString());
								}}
								timeLabel="Return Time"
							/>
						</div>
						<Separator />
						<Button disabled={differenceInDays(endDate, startDate) <= 0}>
							<ShoppingCartIcon />
							Order
						</Button>
					</TabsContent>
				</Tabs>
			</section>
		</div>
	);
}

function calcKmValue(km?: number): [string, number] {
	if (km === undefined) {
		return ["20", 0];
	}

	if (km >= 24000) {
		return ["24", km - 24000];
	}

	if (km >= 20000) {
		return ["20", km - 20000];
	}

	return ["16", km - 16000];
}
