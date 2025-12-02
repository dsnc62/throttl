export type BaseCartItem = {
	id: string | number;
	itemType: "car" | "accessory";
	name: string;
};

export type BaseCarCartItem = BaseCartItem & {
	annualKM?: number;
	endDate?: string;
	freq?: "weekly" | "bi-weekly" | "monthly";
	id: string;
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
	id: number;
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

export type OrderDetails = {
	address: string;
	cardNumber: string;
	city: string;
	user: string;
	expMonth: number;
	expYear: number;
	postalCode: string;
	province:
		| "AB"
		| "BC"
		| "MB"
		| "NB"
		| "NL"
		| "NT"
		| "NS"
		| "NU"
		| "ON"
		| "PE"
		| "QC"
		| "SK"
		| "YT";
};
