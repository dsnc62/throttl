import { addMonths } from "date-fns";
import { db } from "@/db";
import { accessoryOrder } from "@/db/schema/accessory";
import { carOrder, carPurchaseDetails } from "@/db/schema/car";
import { DEFAULT_FINANCE_RATE, DEFAULT_LEASE_RATE } from "../constants";
import type {
	AccessoryCartItem,
	BaseCarCartItem,
	LeaseCarCartItem,
	OrderDetails,
	RentCarCartItem,
} from "../types";
import { calcTotalCarPrice } from "../utils";
import { getAccessoryById } from "./accessories";
import { getCarFromInventory } from "./cars";

export async function createAccessoryOrder(
	item: AccessoryCartItem,
	details: OrderDetails,
) {
	const shippingAddress = `${details.address}, ${details.city}, ${details.province} ${details.postalCode}`;

	const acc = await getAccessoryById(item.id);
	if (!acc) return;

	// order up to maximum inventory
	for (let i = 0; i < Math.min(item.qty, acc.inventories.length); i++) {
		await db.insert(accessoryOrder).values({
			cardExpMonth: details.expMonth.toString(),
			cardExpYear: details.expYear.toString(),
			cardLast4: details.cardNumber.slice(-4),
			inventory: acc?.inventories[i].id,
			shippingAddress,
			status: "purchased",
			user: details.user,
		});
	}

	return { success: true };
}

export async function createCarOrder(
	item: BaseCarCartItem,
	details: OrderDetails,
) {
	const shippingAddress = `${details.address}, ${details.city}, ${details.province} ${details.postalCode}`;

	const orderId = crypto.randomUUID();
	await db.insert(carOrder).values({
		cardExpMonth: details.expMonth.toString(),
		cardExpYear: details.expYear.toString(),
		cardLast4: details.cardNumber.slice(-4),
		id: orderId,
		inventory: item.id,
		orderType: item.orderType === "rent" ? "rent" : "purchase",
		ownershipExpiry: getOwnershipExpiry(item),
		shippingAddress,
		status: item.orderType === "rent" ? "rented" : "purchased",
		user: details.user,
	});

	// For purchase types, insert details
	if (item.orderType !== "rent") {
		const inv = await getCarFromInventory(item.id);
		const rate =
			item.orderType === "finance"
				? DEFAULT_FINANCE_RATE
				: item.orderType === "lease"
					? DEFAULT_LEASE_RATE
					: null;

		await db.insert(carPurchaseDetails).values({
			annualKM: item.annualKM ?? null,
			freq: item.freq,
			id: crypto.randomUUID(),
			order: orderId,
			purchaseType: item.orderType,
			rate,
			term: item.term,
			totalPrice: inv
				? calcTotalCarPrice(inv.trim.price, inv.trim.car.year, inv.mileage)
				: 0,
			user: details.user,
		});
	}

	return { success: true };
}

function getOwnershipExpiry(item: BaseCarCartItem): Date | null {
	if (item.orderType === "rent") {
		return new Date((item as RentCarCartItem).endDate);
	}

	if (item.orderType === "lease") {
		const i = item as LeaseCarCartItem;
		return addMonths(new Date(), i.term);
	}

	return null;
}
