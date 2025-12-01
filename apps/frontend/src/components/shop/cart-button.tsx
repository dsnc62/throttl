import { Link, useLocation } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";
import { ShoppingCartIcon } from "lucide-react";
import type { Cart } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function CartButton() {
	const location = useLocation();
	const [cart] = useLocalStorage<Cart>("cart", { items: [] });

	return (
		<Button
			asChild
			className="relative"
			size="icon-lg"
			variant={
				location.pathname.startsWith("/shop/cart") ? "default" : "outline"
			}
		>
			<Link to="/shop/cart">
				<ShoppingCartIcon />
				{cart.items.length > 0 && (
					<Badge
						className="-top-1 -right-1 absolute h-4 min-w-4 rounded-full px-1 font-mono text-[0.625rem] tabular-nums"
						variant="destructive"
					>
						{cart.items.length}
					</Badge>
				)}
			</Link>
		</Button>
	);
}
