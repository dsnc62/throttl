import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { differenceInDays, format } from "date-fns";
import { EyeIcon } from "lucide-react";
import { useState } from "react";
import AuthWall from "@/components/auth-wall";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";
import type { AdminTransaction, CarPurchaseDetails } from "@/lib/types";
import { calculateRent } from "@/lib/utils";

const cadFormatter = Intl.NumberFormat("en-CA", {
	currency: "CAD",
	style: "currency",
});

export const Route = createFileRoute("/admin/orders")({
	component: AdminOrders,
});

function AdminOrders() {
	const session = authClient.useSession();
	const navigate = useNavigate({ from: Route.fullPath });

	// states
	const [purchaseDetails, setPurchaseDetails] = useState<
		Record<string, CarPurchaseDetails>
	>({});

	// queries
	const { data, isLoading } = useQuery({
		queryFn: async () => {
			const res = await fetch(
				`${env.VITE_BACKEND_URL}/api/orders/transactions`,
				{
					credentials: "include",
				},
			);

			const data = (await res.json()) as AdminTransaction[];
			return data;
		},
		queryKey: ["admin", "orders", "transactions"],
	});

	// render
	if (!session.data) {
		return <AuthWall callbackURL={Route.fullPath} />;
	}

	if (session.data.user.role !== "admin") {
		navigate({ to: "/shop" });
		return null;
	}

	return (
		<div className="space-y-6">
			<h1 className="font-display font-semibold text-5xl">Orders</h1>

			{data?.length ? (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Customer Name</TableHead>
								<TableHead>Customer Email</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="text-right">Total Price</TableHead>
								<TableHead></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.map((transaction) => (
								<TableRow key={transaction.id}>
									<TableCell className="font-medium">
										{transaction.user.name}
									</TableCell>
									<TableCell>{transaction.user.email}</TableCell>
									<TableCell>{format(transaction.createdAt, "PPp")}</TableCell>
									<TableCell className="text-right">
										{cadFormatter.format(transaction.totalPrice)}
									</TableCell>
									<TableCell>
										<Dialog>
											<DialogTrigger asChild>
												<Button
													className="ml-auto flex"
													size="sm"
													variant="outline"
												>
													<EyeIcon className="h-4 w-4" />
													View
												</Button>
											</DialogTrigger>
											<DialogContent className="max-h-[80vh] md:max-w-[80vw] overflow-y-auto">
												<DialogHeader>
													<DialogTitle className="font-display font-medium">
														Order Details - #{transaction.id.split("-")[0]}
													</DialogTitle>
												</DialogHeader>

												<div className="max-w-full space-y-6 overflow-x-hidden">
													{/* Customer Information */}
													<div>
														<h4 className="mb-2 font-display text-lg">
															Customer Information
														</h4>
														<div className="space-y-1">
															<div>
																<span className="font-medium">Name:</span>{" "}
																{transaction.user.name}
															</div>
															<div>
																<span className="font-medium">Email:</span>{" "}
																{transaction.user.email}
															</div>
														</div>
													</div>

													<Separator />

													{/* Shipping Information */}
													<div>
														<h4 className="mb-2 font-display text-lg">
															Shipping Information
														</h4>
														<div className="space-y-1">
															<div>
																<span className="font-medium">Address:</span>{" "}
																{transaction.address}
															</div>
															<div>
																<span className="font-medium">City:</span>{" "}
																{transaction.city}, {transaction.province}{" "}
															</div>
															<div>
																<span className="font-medium">
																	Postal Code:
																</span>{" "}
																{transaction.postalCode}
															</div>
														</div>
													</div>

													<Separator />

													{/* Payment Information */}
													<div>
														<h4 className="mb-2 font-display text-lg">
															Payment Information
														</h4>
														<div className="space-y-1">
															<div>
																<span className="font-medium">Card:</span> ••••
																•••• •••• {transaction.cardNumber?.slice(-4)}
															</div>
															<div>
																<span className="font-medium">Expiry:</span>{" "}
																{transaction.cardExpMonth
																	?.toString()
																	.padStart(2, "0")}
																/{transaction.cardExpYear}
															</div>
														</div>
													</div>

													<Separator />

													{/* Items */}
													<div>
														<h4 className="mb-2 font-display text-lg">Items</h4>
														<div className="max-w-full rounded-md border bg-card">
															<Table className="overflow-x-auto">
																<TableHeader className="bg-background/50">
																	<TableRow>
																		<TableHead className="w-[100px]">
																			ID
																		</TableHead>
																		<TableHead>Name</TableHead>
																		<TableHead>Type</TableHead>
																		<TableHead>Status</TableHead>
																		<TableHead className="text-right">
																			Amount
																		</TableHead>
																	</TableRow>
																</TableHeader>
																<TableBody>
																	{transaction.accessoryOrders?.map((order) => (
																		<TableRow
																			key={`acc-order-${order.inventory.id}`}
																		>
																			<TableCell className="font-medium">
																				{order.inventory.id}
																			</TableCell>
																			<TableCell>
																				{order.inventory.accessory.name}
																			</TableCell>
																			<TableCell>Accessory</TableCell>
																			<TableCell className="capitalize">
																				{order.status}
																			</TableCell>
																			<TableCell className="text-right">
																				{cadFormatter.format(
																					order.inventory.accessory.price,
																				)}
																			</TableCell>
																		</TableRow>
																	))}
																	{transaction.carOrders?.map((order) => {
																		const car = order.inventory.trim.car;
																		let price: number | undefined;

																		if (order.orderType === "rent") {
																			price = calculateRent(
																				order.inventory.trim.price,
																				differenceInDays(
																					order.ownershipExpiry ??
																						order.createdAt,
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
																				});
																			}
																		}

																		return (
																			<TableRow
																				key={`car-order-${order.inventory.id}`}
																			>
																				<TableCell className="font-medium">
																					{order.inventory.id}
																				</TableCell>
																				<TableCell>
																					{car.make.name} {car.model}{" "}
																					{order.inventory.trim.name}
																				</TableCell>
																				<TableCell>Car</TableCell>
																				<TableCell className="capitalize">
																					{order.status}
																				</TableCell>
																				<TableCell className="text-right">
																					{price
																						? cadFormatter.format(price)
																						: "N/A"}
																				</TableCell>
																			</TableRow>
																		);
																	})}
																</TableBody>
															</Table>
														</div>
													</div>
												</div>
											</DialogContent>
										</Dialog>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : isLoading ? (
				<Spinner />
			) : (
				<div className="text-center text-muted-foreground">
					No transactions found.
				</div>
			)}
		</div>
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
