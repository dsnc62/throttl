import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useWindowSize } from "@uidotdev/usehooks";
import { format } from "date-fns";
import Confetti from "react-confetti";
import z from "zod";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { env } from "@/env";
import type { Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";

const cadFormatter = Intl.NumberFormat("en-CA", {
	currency: "CAD",
	style: "currency",
});

const searchSchema = z.object({
	id: z.string(),
});

export const Route = createFileRoute("/shop/checkout/success")({
	component: ShopCheckoutSuccess,
	validateSearch: searchSchema,
});

function ShopCheckoutSuccess() {
	const { id } = Route.useSearch();
	const { height, width } = useWindowSize();

	const { data, isLoading } = useQuery({
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/orders/transactions/${id}`,
				{
					credentials: "include",
				},
			);
			return (await res.json()) as Transaction;
		},
		queryKey: ["orders", "transactions", id],
	});

	if (isLoading) {
		return <Spinner />;
	}

	if (!data) {
		return <div>Transaction Not Found</div>;
	}

	return (
		<>
			<Confetti height={height ?? undefined} width={width ?? undefined} />
			<h1 className="font-display font-semibold text-5xl">
				Thank You for Shopping with Us!
			</h1>
			<div>
				<h2 className="font-display font-medium text-2xl">
					Order #{id.split("-")[0]}
				</h2>
				<span className="text-muted-foreground">
					{format(data.createdAt, "PPp")}
				</span>
				<div className="mt-2 overflow-hidden rounded-lg border bg-card">
					<Table>
						<TableHeader className="bg-background/50">
							<TableRow>
								<TableHead className="w-[100px]">ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.accessoryOrders?.map((order) => (
								<TableRow key={`acc-order-${order.inventory.id}`}>
									<TableCell className="font-medium">
										{order.inventory.id}
									</TableCell>
									<TableCell>{order.inventory.accessory.name}</TableCell>
									<TableCell>Accessory</TableCell>
									<TableCell className="capitalize">{order.status}</TableCell>
								</TableRow>
							))}
							{data.carOrders?.map((order) => {
								const car = order.inventory.trim.car;

								return (
									<TableRow key={`car-order-${order.inventory.id}`}>
										<TableCell className="font-medium">
											{order.inventory.id}
										</TableCell>
										<TableCell>
											{car.make.name} {car.model} {order.inventory.trim.name}
										</TableCell>
										<TableCell>Car</TableCell>
										<TableCell className="capitalize">{order.status}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
						<TableFooter>
							<TableRow>
								<TableCell colSpan={3}>Amount Paid</TableCell>
								<TableCell className="text-right">
									{cadFormatter.format(data.totalPrice)}
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</div>
			</div>
			<Button asChild variant="secondary">
				<Link to="/shop">Back to Shop</Link>
			</Button>
		</>
	);
}
