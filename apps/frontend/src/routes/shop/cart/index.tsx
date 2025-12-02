import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";
import { differenceInDays } from "date-fns";
import { Trash2Icon } from "lucide-react";
import { useCallback, useMemo } from "react";
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
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";
import { DEFAULT_FINANCE_RATE, DEFAULT_LEASE_RATE } from "@/lib/constants";
import type {
	Accessory,
	AccessoryCartItem,
	BaseCarCartItem,
	CarInventory,
	Cart,
	FinanceCarCartItem,
	LeaseCarCartItem,
	RentCarCartItem,
} from "@/lib/types";
import {
	calcLeasePrice,
	calcLoanPayments,
	calcTotalCarPrice,
	calculateRent,
	capitalize,
	pluralize,
} from "@/lib/utils";

const cadFormatter = Intl.NumberFormat("en-CA", {
	currency: "CAD",
	style: "currency",
});

export const Route = createFileRoute("/shop/cart/")({
	component: ShopCart,
});

function ShopCart() {
	const [cart, setCart] = useLocalStorage<Cart>("cart", { items: [] });

	// derived
	const carIds = useMemo(() => {
		return cart.items
			.filter((item) => item.itemType === "car")
			.map((item) => item.id as string);
	}, [cart.items]);

	const accessoryIds = useMemo(() => {
		return cart.items
			.filter((item) => item.itemType === "accessory")
			.map((item) => item.id as number);
	}, [cart.items]);

	// queries
	const { data: cars } = useQuery({
		enabled: carIds.length > 0,
		queryFn: async () => {
			if (carIds.length === 0) return [];
			const params = new URLSearchParams({ ids: carIds.join(",") });
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/cart/details?${params}`,
			);
			return (await res.json()) as CarInventory[];
		},
		queryKey: ["cart", "cars", carIds.sort().join(",")],
	});

	const { data: accessories } = useQuery({
		enabled: accessoryIds.length > 0,
		queryFn: async () => {
			if (accessoryIds.length === 0) return [];
			const params = new URLSearchParams({ ids: accessoryIds.join(",") });
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/cart/accessories?${params}`,
			);
			return (await res.json()) as Accessory[];
		},
		queryKey: ["cart", "accessories", accessoryIds.sort().join(",")],
	});

	const { data: cartTotal, isLoading: isLoadingCartTotal } = useQuery({
		queryFn: async () => {
			const res = await fetch(`${env.VITE_BACKEND_URL}/api/cart/total`, {
				body: JSON.stringify(cart),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const data = (await res.json()) as { total: number };
			return data;
		},
		queryKey: ["cart", "total", JSON.stringify(cart)],
	});

	// callbacks
	const handleRemove = useCallback(
		(id: string | number) => {
			setCart((prev) => ({
				items: prev.items.filter((item) => item.id !== id),
			}));
		},
		[setCart],
	);

	const handleQtyChange = useCallback(
		(id: number, qty: number) => {
			setCart((prev) => ({
				items: prev.items.map((item) =>
					item.id === id ? { ...item, qty } : item,
				),
			}));
		},
		[setCart],
	);

	return (
		<div className="flex gap-6">
			<section className="@container/cart-details flex-3">
				<h1 className="mb-4 font-display font-semibold text-5xl">My Cart</h1>
				<div className="grid gap-3 xl:grid-cols-2">
					{cart.items.length === 0 && (
						<div className="text-muted-foreground">
							There's nothing here.
							<Button asChild className="w-fit px-2" variant="link">
								<Link to="/shop">Return to Shop?</Link>
							</Button>
						</div>
					)}
					{cart.items.map((i) => {
						if (i.itemType === "car") {
							const data = cars?.find((c) => c.id === i.id);

							return data ? (
								<CarItemCard
									data={data}
									item={i}
									key={i.id}
									onRemove={handleRemove}
								/>
							) : null;
						}

						if (i.itemType === "accessory") {
							const data = accessories?.find((a) => a.id === i.id);

							return data ? (
								<AccessoryItemCard
									data={data}
									item={i as AccessoryCartItem}
									key={i.id}
									onQtyChange={handleQtyChange}
									onRemove={handleRemove}
								/>
							) : null;
						}

						return null;
					})}
				</div>
			</section>
			<section className="h-fit min-w-80 flex-2 shrink-0 rounded-xl border bg-card p-4">
				<div className="border-b pt-1 pb-3">
					<h2 className="mb-2 font-display font-semibold text-2xl">Summary</h2>
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-muted-foreground">
							<span>Subtotal:</span>
							<span>
								{isLoadingCartTotal ? (
									<Spinner />
								) : (
									cadFormatter.format((cartTotal?.total ?? 0) / 1.13)
								)}
							</span>
						</div>
						<div className="flex justify-between text-muted-foreground">
							<span>Taxes:</span>
							<span>
								{isLoadingCartTotal ? (
									<Spinner />
								) : (
									cadFormatter.format(
										(cartTotal?.total ?? 0) - (cartTotal?.total ?? 0) / 1.13,
									)
								)}
							</span>
						</div>
						<div className="flex justify-between font-medium text-lg">
							<span>Total:</span>
							<span>
								{isLoadingCartTotal ? (
									<Spinner />
								) : (
									cadFormatter.format(cartTotal?.total ?? 0)
								)}
							</span>
						</div>
					</div>
				</div>
				<Button
					asChild={!!cartTotal?.total}
					className="mt-4 w-full"
					disabled={!cartTotal?.total}
				>
					<Link to="/shop/checkout">Checkout</Link>
				</Button>
			</section>
		</div>
	);
}

function AccessoryItemCard(props: {
	data: Accessory;
	item: AccessoryCartItem;
	onRemove: (id: number) => void;
	onQtyChange: (id: number, qty: number) => void;
}) {
	const { data, item } = props;

	const pricing = useMemo(() => {
		const totalPrice = cadFormatter.format(data.price * item.qty * 1.13);
		return totalPrice;
	}, [data.price, item.qty]);

	return (
		<Card>
			<div className="-mt-6 -mb-4 p-2">
				<img
					alt={`${item.name} by ${data.make}`}
					className="aspect-video w-full rounded-lg border bg-secondary object-cover"
					onError={(ev) => {
						ev.currentTarget.src = "/images/Missing-image.png";
					}}
					src={data.image ?? "Missing-image.png"}
				/>
			</div>
			<CardHeader>
				<div className="flex items-start justify-between gap-3">
					<CardTitle>
						{data.make} {data.name}
					</CardTitle>
					<span className="leading-none">{pricing}</span>
				</div>
				<CardDescription className="flex items-center">
					{capitalize(data.category)}
				</CardDescription>
			</CardHeader>
			<CardFooter className="mt-auto items-center justify-end gap-3">
				<Button
					onClick={() => props.onRemove(data.id)}
					size="icon"
					variant="destructive"
				>
					<Trash2Icon />
				</Button>
				<Select onValueChange={(v) => props.onQtyChange(item.id, Number(v))}>
					<SelectTrigger className="w-20" value={item.qty.toString()}>
						<SelectValue placeholder={item.qty} />
					</SelectTrigger>
					<SelectContent>
						{Array.from(
							{ length: Math.min(10, data.inventories.length) },
							(_, i) => (
								<SelectItem
									key={`${item.name}-qty-${i + 1}`}
									value={(i + 1).toString()}
								>
									{i + 1}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
				<Button asChild variant="secondary">
					<Link search={{ id: props.data.id }} to="/shop/accessories/info">
						View
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

function CarItemCard(props: {
	item: BaseCarCartItem;
	data: CarInventory;
	onRemove: (id: string) => void;
}) {
	const car = props.data.trim.car;

	// derived
	const additionalDetails = useMemo(() => {
		if (props.item.orderType === "cash") {
			return "";
		}

		if (props.item.orderType === "rent") {
			const item = props.item as RentCarCartItem;
			return `• ${pluralize(differenceInDays(item.endDate, item.startDate), "day")}`;
		}

		const item = props.item as FinanceCarCartItem | LeaseCarCartItem;
		return `• ${capitalize(item.freq)} • ${item.term} mo`;
	}, [props.item]);

	const pricing = useMemo(() => {
		const totalPrice = calcTotalCarPrice(
			props.data.trim.price,
			car.year,
			props.data.mileage,
		);

		if (props.item.orderType === "cash") {
			return cadFormatter.format(totalPrice);
		}

		if (props.item.orderType === "rent") {
			const item = props.item as RentCarCartItem;

			const price =
				calculateRent(
					props.data.trim.price,
					differenceInDays(item.endDate, item.startDate),
					car.estLifespanKM,
				) * 1.13;

			return cadFormatter.format(price);
		}

		if (props.item.orderType === "finance") {
			const item = props.item as FinanceCarCartItem;

			const loan = calcLoanPayments(
				totalPrice,
				DEFAULT_FINANCE_RATE,
				item.term / 12,
			);

			return cadFormatter.format(loan[item.freq]);
		}

		const item = props.item as LeaseCarCartItem;
		const price = calcLeasePrice(
			totalPrice,
			item.term,
			item.annualKM,
			car.estLifespanKM,
		);

		const loan = calcLoanPayments(price, DEFAULT_LEASE_RATE, item.term / 12);
		return cadFormatter.format(loan[item.freq]);
	}, [
		car.year,
		props.data.mileage,
		props.data.trim.price,
		props.item,
		car.estLifespanKM,
	]);

	return (
		<Card>
			<div className="-mt-6 -mb-4 p-2">
				<img
					alt={`${car.year} ${car.make.name} ${car.model}`}
					className="aspect-video w-full rounded-lg border bg-secondary object-cover"
					onError={(ev) => {
						ev.currentTarget.src = "/images/No_car.png";
					}}
					src={car.image ?? "/images/No_car.png"}
				/>
			</div>
			<CardHeader>
				<div className="flex items-start justify-between gap-3">
					<CardTitle>
						{car.year} {car.make.name} {car.model} {props.data.trim.name}
					</CardTitle>

					<span className="leading-none">{pricing}</span>
				</div>
				<CardDescription className="flex items-center">
					<div
						className="mr-1 size-3 rounded-full border border-foreground/30"
						style={{
							backgroundColor: props.data.color.replaceAll(" ", ""),
						}}
					/>
					{capitalize(props.data.color)} •{" "}
					{props.item.orderType === "rent" ? "Unlimited " : props.data.mileage}
					KM • {capitalize(props.item.orderType)} {additionalDetails}
				</CardDescription>
			</CardHeader>
			<CardFooter className="mt-auto items-center justify-end gap-3">
				<Button
					onClick={() => props.onRemove(props.data.id)}
					size="icon"
					variant="destructive"
				>
					<Trash2Icon />
				</Button>
				<Button asChild variant="secondary">
					<Link search={{ id: props.data.id }} to="/shop/cars/info">
						View
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
