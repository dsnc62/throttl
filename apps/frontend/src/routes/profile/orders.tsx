import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { differenceInDays, format } from "date-fns";
import { useState } from "react";
import AuthWall from "@/components/auth-wall";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";
import type { CarPurchaseDetails, Transaction } from "@/lib/types";
import { calculateRent } from "@/lib/utils";

const cadFormatter = Intl.NumberFormat("en-CA", {
	currency: "CAD",
	style: "currency",
});

export const Route = createFileRoute("/profile/orders")({
	component: ProfileOrders,
});

function ProfileOrders() {
	const session = authClient.useSession();

	// queries
	const { data, isLoading } = useQuery({
		enabled: !!session.data,
		queryFn: async () => {
			if (!session.data) return undefined;

			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/orders/users/${session.data.user.id}/transactions`,
				{
					credentials: "include",
				},
			);

			const data = (await res.json()) as Transaction[];
			return data;
		},
		queryKey: [
			"orders",
			"users",
			session.data?.user.id ?? "unauth",
			"transactions",
		],
	});

	// states
	const [purchaseDetails, setPurchaseDetails] = useState<
		Record<string, CarPurchaseDetails>
	>({});

	// render
	if (!session) {
		return <AuthWall callbackURL={Route.fullPath} />;
	}

	return (
		<>
			<h1 className="font-display font-semibold text-5xl">Orders</h1>

			{data?.length ? (
				<div className="flex flex-col gap-4">
					{data.map((tx) => (
						<div key={`tx-${tx.id}`}>
							<h2 className="font-display font-medium text-2xl">
								Order #{tx.id.split("-")[0]}
							</h2>
							<span className="text-muted-foreground">
								{format(tx.createdAt, "PPp")}
							</span>
							<Table>
								<TableCaption>Reference ID: {tx.id}</TableCaption>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[100px]">ID</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Price</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{tx.accessoryOrders?.map((order) => (
										<TableRow key={`acc-order-${order.inventory.id}`}>
											<TableCell className="font-medium">
												{order.inventory.id}
											</TableCell>
											<TableCell>{order.inventory.accessory.name}</TableCell>
											<TableCell>Accessory</TableCell>
											<TableCell className="capitalize">
												{order.status}
											</TableCell>
											<TableCell className="text-right">
												{cadFormatter.format(order.inventory.accessory.price)}
											</TableCell>
										</TableRow>
									))}
									{tx.carOrders?.map((order) => {
										const car = order.inventory.trim.car;
										let price: number | undefined;

										if (order.orderType === "rent") {
											price = calculateRent(
												order.inventory.trim.price,
												differenceInDays(
													order.ownershipExpiry ?? order.createdAt,
													order.createdAt,
												),
												car.estLifespanKM,
											);
										} else {
											const details = purchaseDetails[order.id];
											if (details) {
												price = details.totalPrice;
											} else {
												getCarDetails(order.id).then((d) => {
													if (!d) return;
													setPurchaseDetails((prev) => ({
														...prev,
														[order.id]: d,
													}));

													price = d.totalPrice;
												});
											}
										}

										return (
											<TableRow key={`car-order-${order.inventory.id}`}>
												<TableCell className="font-medium">
													{order.inventory.id}
												</TableCell>
												<TableCell>
													{car.make.name} {car.model}{" "}
													{order.inventory.trim.name}
												</TableCell>
												<TableCell>Accessory</TableCell>
												<TableCell className="capitalize">
													{order.status}
												</TableCell>
												<TableCell className="text-right">
													{price ? cadFormatter.format(price) : "N/A"}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					))}
				</div>
			) : isLoading ? (
				<Spinner />
			) : (
				<div></div>
			)}
		</>
	);
}

async function getCarDetails(orderID: string) {
	const res = await fetch(
		`${env.VITE_BACKEND_URL}/api/orders/cars/${orderID}/details`,
		{
			credentials: "include",
		},
	);
	const data = (await res.json()) as CarPurchaseDetails | undefined;
	return data;
}
