import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function capitalize(text: string) {
	return text
		.split(" ")
		.map((t) => t[0].toUpperCase() + t.slice(1))
		.join(" ");
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
