import { addMonths } from "date-fns";
import { db } from "@/db";
import { accessoryOrder } from "@/db/schema/accessory";
import { carOrder, carPurchaseDetails } from "@/db/schema/car";
import { transaction } from "@/db/schema/transaction";
import { DEFAULT_FINANCE_RATE, DEFAULT_LEASE_RATE } from "../constants";
import type {
	AccessoryCartItem,
	BaseCarCartItem,
	Cart,
	LeaseCarCartItem,
	OrderDetails,
	RentCarCartItem,
} from "../types";
import { calcCartTotal, calcTotalCarPrice } from "../utils";
import { getAccessoryById } from "./accessories";
import { getCarFromInventory } from "./cars";

export async function createTransaction(
	txID: string,
	cart: Cart,
	details: OrderDetails,
) {
	const totalPrice = await calcCartTotal(cart);

	await db.insert(transaction).values({
		...details,
		cardExpMonth: details.expMonth,
		cardExpYear: details.expYear,
		cardLast4: details.cardNumber.slice(-4),
		id: txID,
		totalPrice,
	});
}

export async function createAccessoryOrder(
	txID: string,
	item: AccessoryCartItem,
) {
	const acc = await getAccessoryById(item.id);
	if (!acc) return;

	// order up to maximum inventory
	for (let i = 0; i < Math.min(item.qty, acc.inventories.length); i++) {
		await db.insert(accessoryOrder).values({
			inventory: acc?.inventories[i].id,
			status: "purchased",
			tx: txID,
		});
	}

	return { success: true };
}

export async function createCarOrder(txID: string, item: BaseCarCartItem) {
	const orderId = crypto.randomUUID();
	await db.insert(carOrder).values({
		id: orderId,
		inventory: item.id,
		orderType: item.orderType === "rent" ? "rent" : "purchase",
		ownershipExpiry: getOwnershipExpiry(item),
		status: item.orderType === "rent" ? "rented" : "purchased",
		tx: txID,
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
