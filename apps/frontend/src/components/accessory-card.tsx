import { Link } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { Accessory, AccessoryCartItem, Cart } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";

export default function AccessoryCard({ accessory }: { accessory: Accessory }) {
	// states
	const [cart, setCart] = useLocalStorage<Cart>("cart", { items: [] });

	// derived
	const isInCart = useMemo(() => {
		return cart.items.some((i) => i.id === accessory.id);
	}, [accessory, cart.items]);

	// callbacks
	const handleAddToCart = useCallback(() => {
		if (accessory.inventories.length === 0) return;
		const cartItem: AccessoryCartItem = {
			id: accessory.id,
			itemType: "accessory",
			name: `${accessory.make} ${accessory.name}`,
			qty: 1,
		};

		setCart((prev) => ({ items: [...prev.items, cartItem] }));
		toast.success(`${accessory.name} added to cart.`);
	}, [accessory, setCart]);

	return (
		<Card>
			<div className="-mt-6 -mb-4 p-2">
				<img
					alt={`${accessory.name} by ${accessory.make}`}
					className="aspect-video w-full rounded-lg border bg-secondary object-cover"
					onError={(ev) => {
						ev.currentTarget.src = "/images/Missing-image.png";
					}}
					src={accessory.image ?? "Missing-image.png"}
				/>
			</div>
			<CardHeader>
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
					{accessory.universal && <Badge variant="secondary">Universal</Badge>}
				</div>
			</CardHeader>
			<CardFooter className="items-center justify-end gap-3">
				<Button variant="secondary">
					<Link search={{ id: accessory.id }} to="/shop/accessories/info">
						Learn More
					</Link>
				</Button>
				<Button
					disabled={isInCart || accessory.inventories.length <= 0}
					onClick={handleAddToCart}
				>
					{accessory.inventories.length > 0 ? "Add to Cart" : "Sold Out"}
				</Button>
			</CardFooter>
		</Card>
	);
}
