import {
	CAR_PURCHASE_FEES,
	DEFAULT_FINANCE_RATE,
	DEFAULT_LEASE_RATE,
} from "./constants.js";
import { getAccessoriesByIds } from "./dao/accessories.js";
import { getCarInventory } from "./dao/cars.js";
import type {
	Cart,
	FinanceCarCartItem,
	LeaseCarCartItem,
	RentCarCartItem,
} from "./types.js";

export function calcTotalCarPrice(
	initialPrice: number,
	year: number,
	currentMileage: number,
) {
	const today = new Date();

	const actualPrice = calcDepreciatedValue(
		initialPrice,
		Math.max(0, today.getFullYear() - year),
		currentMileage,
	);
	return (actualPrice + CAR_PURCHASE_FEES) * 1.13;
}

export function calcDepreciatedValue(
	initialPrice: number,
	age: number,
	mileage: number,
) {
	/* ASSUMPTIONS
	 * year 1: 20% depreciation
	 * following years: 15% depreciation on previous year's price (e.g 20K -> 16K -> 13.6K -> ...)
	 * slight bonus/penalty for low/high mileage: 1.5% (arbitrary) per 800KM (1/10th of a service interval)
	 */

	// car can still be considered new
	if (age === 0 && mileage <= 150) {
		return initialPrice;
	}

	let value = initialPrice;

	if (age <= 1) {
		value = initialPrice * 0.8;
	} else {
		value = initialPrice * 0.8 * 0.85 ** (age - 2);
	}

	const mileageDiff = mileage - 20000 * age;
	const adjustment = 0.015 * (mileageDiff / 800);

	value *= 1 - adjustment;

	return Math.max(0, value);
}

export function calculateRent(
	price: number,
	days: number,
	estLifespanKM: number,
) {
	/* ASSUMPTIONS
	 * car can be used as a rental for 3 years (60,000-80,000 KM)
	 * 850KM a day is the max someone can drive
	 * average maintainance will be $150 every 8000 KM (standard service interval)
	 * fuel not included, customer pays (or additional fee)
	 */

	const depreciatedValue = calcDepreciatedValue(price, 3, 80000);

	// 10% removed from sale price to account for rental car stigma
	const dollarsPerKm =
		(price - depreciatedValue * 0.9) / estLifespanKM + 150 / 8000;

	return dollarsPerKm * (850 * days);
}

export function calcLoanPayments(
	price: number,
	rate: number,
	termYears: number,
) {
	const annualRate = rate / 100;

	if (annualRate === 0) {
		const numMonthlyPayments = termYears * 12;
		const numWeeklyPayments = termYears * 52;
		const numBiWeeklyPayments = termYears * 26;
		return {
			"bi-weekly": price / numBiWeeklyPayments,
			monthly: price / numMonthlyPayments,
			weekly: price / numWeeklyPayments,
		};
	}

	// Monthly payment
	const monthlyRate = annualRate / 12;
	const numMonthlyPayments = termYears * 12;
	const monthly =
		(price * monthlyRate * (1 + monthlyRate) ** numMonthlyPayments) /
		((1 + monthlyRate) ** numMonthlyPayments - 1);

	// Weekly payment
	const weeklyRate = annualRate / 52;
	const numWeeklyPayments = termYears * 52;
	const weekly =
		(price * weeklyRate * (1 + weeklyRate) ** numWeeklyPayments) /
		((1 + weeklyRate) ** numWeeklyPayments - 1);

	// Bi-weekly payment
	const biWeeklyRate = annualRate / 26;
	const numBiWeeklyPayments = termYears * 26;
	const biWeekly =
		(price * biWeeklyRate * (1 + biWeeklyRate) ** numBiWeeklyPayments) /
		((1 + biWeeklyRate) ** numBiWeeklyPayments - 1);

	return { "bi-weekly": biWeekly, monthly, weekly };
}

export function calcLeasePrice(
	totalPrice: number,
	term: number,
	annualkm: number,
	estLifespanKM: number,
) {
	const age = term / 12;
	const depreciation = calcDepreciatedValue(totalPrice, age, annualkm * age);
	const ratio = depreciation / totalPrice; // add a depreciation factor to the price

	const pricePerKM = totalPrice / estLifespanKM; // take off 5% of value because $$$
	const price = pricePerKM * (1 + ratio) * (annualkm ?? 20000) * age; // estimated multiplier based on similar Camry on Toyota's site

	return price;
}

export async function calcCartTotal(cart: Cart) {
	const carIds = cart.items
		.filter((item) => item.itemType === "car")
		.map((item) => item.id);

	const accessoryIds = cart.items
		.filter((item) => item.itemType === "accessory")
		.map((item) => item.id);

	const [cars, accessories] = await Promise.all([
		carIds.length > 0
			? getCarInventory({ filters: { ids: carIds } })
			: Promise.resolve([]),
		accessoryIds.length > 0
			? getAccessoriesByIds(accessoryIds)
			: Promise.resolve([]),
	]);

	let total = 0;

	for (const item of cart.items) {
		if (item.itemType === "accessory") {
			const accessory = accessories.find((a) => a.id === item.id);
			if (accessory) {
				total += accessory.price * item.qty * 1.13;
			}

			continue;
		}

		const car = cars.find((c) => c.id === item.id);
		if (car) {
			const basePrice = calcTotalCarPrice(
				car.trim.price,
				car.trim.car.year,
				car.mileage,
			);
			if (item.orderType === "cash") {
				total += basePrice;
				continue;
			}

			if (item.orderType === "rent") {
				const typedItem = item as RentCarCartItem;
				const days = Math.ceil(
					(new Date(typedItem.endDate).getTime() -
						new Date(typedItem.startDate).getTime()) /
						(1000 * 60 * 60 * 24),
				);
				total +=
					calculateRent(car.trim.price, days, car.trim.car.estLifespanKM) *
					1.13;

				continue;
			}

			if (item.orderType === "finance") {
				const typedItem = item as FinanceCarCartItem;
				const loan = calcLoanPayments(
					basePrice,
					DEFAULT_FINANCE_RATE,
					typedItem.term / 12,
				);
				total += loan[typedItem.freq];
				continue;
			}

			const typedItem = item as LeaseCarCartItem;
			const leasePrice = calcLeasePrice(
				basePrice,
				typedItem.term,
				typedItem.annualKM,
				car.trim.car.estLifespanKM,
			);
			const loan = calcLoanPayments(
				leasePrice,
				DEFAULT_LEASE_RATE,
				typedItem.term / 12,
			);
			total += loan[typedItem.freq];
		}
	}

	return total;
}
