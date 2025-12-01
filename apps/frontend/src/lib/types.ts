export type CarMake = {
	id: number;
	name: string;
	country: "america" | "china" | "germany" | "japan" | "sweden" | "south-korea";
	website: string;
};

export type CarTrim = {
	id: number;
	name: string;
	price: number;
	car: number;
	fuel: "gasoline" | "diesel" | "electric" | "hybrid" | "phev";
	fuelEcon: number;
	transmission: "automatic" | "cvt" | "e-cvt" | "manual" | "none";
	xwd: "fwd" | "rwd" | "awd" | "4wd";
};

export type Car = {
	class: "hatchback" | "minivan" | "sedan" | "sports-car" | "suv" | "truck";
	estLifespanKM: number;
	generation: number;
	id: number;
	make: number & CarMake;
	model: string;
	seats: number;
	size: "compact" | "mid-size" | "large" | null;
	tagline: string | null;
	website: string | null;
	year: number;
	trims: CarTrim[];
};

export type CarInventory = {
	trim: CarTrim & { car: Omit<Car, "trims"> };
	id: string;
	createdAt: Date;
	updatedAt: Date;
	color: string;
	mileage: number;
	purchasable: boolean;
	rentable: boolean;
};

export type Accessory = {
	category:
		| "air fresheners"
		| "cleaning"
		| "dashcams"
		| "exterior protection"
		| "mats";
	id: number;
	make: string;
	name: string;
	price: number;
	universal: boolean;
	cars: AccessoryCarXref[];
	inventories: AccessoryInventory[];
};

export type AccessoryCarXref = {
	accessory: number;
	car: number;
};

export type AccessoryInventory = {
	accessory: Omit<Accessory, "inventories">;
	id: string;
	createdAt: Date;
	orders: number;
};

/*
 * SHOPPING CART
 */

export type BaseCartItem = {
	id: CarInventory["id"] | Accessory["id"];
	itemType: "car" | "accessory";
	name: string;
};

export type BaseCarCartItem = BaseCartItem & {
	annualKM?: number;
	endDate?: string;
	freq?: "weekly" | "bi-weekly" | "monthly";
	id: CarInventory["id"];
	itemType: "car";
	orderType: "lease" | "finance" | "cash" | "rent";
	startDate?: string;
	term?: number;
};

export type PurchaseCarCartItem = BaseCarCartItem & {
	annualKM?: number;
	endDate?: never;
	orderType: "lease" | "finance" | "cash";
	startDate?: never;
};

export type FinanceCarCartItem = PurchaseCarCartItem & {
	annualKM?: never;
	orderType: "finance";
	freq: "weekly" | "bi-weekly" | "monthly";
	term: number;
};

export type LeaseCarCartItem = PurchaseCarCartItem & {
	annualKM: number;
	freq: "weekly" | "bi-weekly" | "monthly";
	orderType: "lease";
	term: number;
};

export type CashCarCartItem = PurchaseCarCartItem & {
	freq?: never;
	annualKM?: never;
	orderType: "cash";
	term?: never;
};

export type RentCarCartItem = BaseCarCartItem & {
	endDate: string;
	startDate: string;
	type: "rent";
};

export type AccessoryCartItem = BaseCartItem & {
	itemType: "accessory";
	id: Accessory["id"];
	qty: number;
};

export type Cart = {
	items: (
		| BaseCarCartItem
		| LeaseCarCartItem
		| FinanceCarCartItem
		| CashCarCartItem
		| RentCarCartItem
		| AccessoryCartItem
	)[];
};
