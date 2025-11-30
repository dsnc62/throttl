import type { createInsertSchema } from "drizzle-zod";
import type z from "zod";
import { db } from ".";
import {
	accessory,
	accessoryCarXref,
	accessoryInventory,
} from "./schema/accessory";
import { car, carInventory, carManufacturer, carTrim } from "./schema/car";

type Accessory = z.infer<
	ReturnType<typeof createInsertSchema<typeof accessory>>
>;

type AccessoryCarXref = z.infer<
	ReturnType<typeof createInsertSchema<typeof accessoryCarXref>>
>;

type AccessoryInventory = z.infer<
	ReturnType<typeof createInsertSchema<typeof accessoryInventory>>
>;

type Car = z.infer<ReturnType<typeof createInsertSchema<typeof car>>>;

type CarManufacturer = z.infer<
	ReturnType<typeof createInsertSchema<typeof carManufacturer>>
>;

type CarTrim = z.infer<ReturnType<typeof createInsertSchema<typeof carTrim>>>;

type CarInventory = z.infer<
	ReturnType<typeof createInsertSchema<typeof carInventory>>
>;

/* CARS */
const MAKES: CarManufacturer[] = [
	{
		country: "japan",
		id: 1,
		name: "Toyota",
		website: "https://toyota.ca",
	},
	{
		country: "japan",
		id: 2,
		name: "Lexus",
		website: "https://lexus.ca",
	},
	{
		country: "japan",
		id: 3,
		name: "Mazda",
		website: "https://mazda.ca",
	},
	{
		country: "japan",
		id: 4,
		name: "Honda",
		website: "https://honda.ca",
	},
	{
		country: "japan",
		id: 5,
		name: "Acura",
		website: "https://acura.ca",
	},
	{
		country: "south-korea",
		id: 6,
		name: "Kia",
		website: "https://kia.ca",
	},
	{
		country: "south-korea",
		id: 7,
		name: "Hyundai",
		website: "https://hyundaicanada.com",
	},
	{
		country: "germany",
		id: 8,
		name: "BMW",
		website: "https://bmw.ca",
	},
	{
		country: "germany",
		id: 9,
		name: "Volkswagen",
		website: "https://vw.ca",
	},
	{
		country: "sweden",
		id: 10,
		name: "Volvo",
		website: "https://www.volvocars.com/en-ca",
	},
	{
		country: "america",
		id: 11,
		name: "Ford",
		website: "https://www.ford.ca",
	},
	{
		country: "america",
		id: 12,
		name: "Tesla",
		website: "https://www.tesla.com/en_ca",
	},
];

const CARS: Car[] = [
	// Toyota (make: 1)
	{
		class: "sedan",
		estLifespanKM: 200000,
		generation: 9,
		make: 1,
		model: "Camry",
		seats: 5,
		size: "mid-size",
		tagline: "Stunning design. Legendary reliability. Completely hybrid.",
		year: 2026,
	},
	{
		class: "sedan",
		estLifespanKM: 200000,
		generation: 12,
		make: 1,
		model: "Corolla",
		seats: 5,
		size: "compact",
		tagline: "A Corolla for Everyone",
		year: 2026,
	},
	{
		class: "hatchback",
		estLifespanKM: 150000,
		generation: 1,
		make: 1,
		model: "GR Corolla",
		seats: 4,
		size: "compact",
		tagline: "Born from Rally-Racing",
		year: 2025,
	},
	{
		class: "suv",
		estLifespanKM: 200000,
		generation: 5,
		make: 1,
		model: "RAV4",
		seats: 5,
		tagline: "There’s More Out There",
		year: 2025,
	},
	{
		class: "minivan",
		estLifespanKM: 200000,
		generation: 4,
		make: 1,
		model: "Sienna",
		seats: 7,
		tagline: "Live Your Life in Style",
		year: 2025,
	},
	{
		class: "sports-car",
		estLifespanKM: 150000,
		generation: 2,
		make: 1,
		model: "GR86",
		seats: 4,
		size: "compact",
		tagline: "Track Ready. Everyday Worthy",
		year: 2025,
	},
	{
		class: "hatchback",
		estLifespanKM: 200000,
		generation: 5,
		make: 1,
		model: "Prius",
		seats: 5,
		tagline: "The World’s Most Renowned Hybrid.",
		year: 2025,
	},

	// Lexus (make: 2)
	{
		class: "suv",
		estLifespanKM: 200000,
		generation: 5,
		make: 2,
		model: "RX",
		seats: 5,
		size: "mid-size",
		tagline: "Luxury Redefined",
		year: 2025,
	},
	{
		class: "sedan",
		estLifespanKM: 200000,
		generation: 8,
		make: 2,
		model: "ES",
		seats: 5,
		size: "mid-size",
		tagline: "Elegance in Motion",
		year: 2025,
	},

	// Mazda (make: 3)
	{
		class: "suv",
		estLifespanKM: 180000,
		generation: 3,
		make: 3,
		model: "CX-5",
		seats: 5,
		size: "mid-size",
		tagline: "Zoom-Zoom Meets Adventure",
		year: 2025,
	},
	{
		class: "sedan",
		estLifespanKM: 180000,
		generation: 4,
		make: 3,
		model: "Mazda3",
		seats: 5,
		size: "compact",
		tagline: "Driving Matters",
		year: 2025,
	},

	// Honda (make: 4)
	{
		class: "sedan",
		estLifespanKM: 200000,
		generation: 11,
		make: 4,
		model: "Civic",
		seats: 5,
		size: "compact",
		tagline: "The People's Car",
		year: 2025,
	},
	{
		class: "suv",
		estLifespanKM: 200000,
		generation: 6,
		make: 4,
		model: "CR-V",
		seats: 5,
		size: "mid-size",
		tagline: "Honda's Best Seller",
		year: 2025,
	},

	// Acura (make: 5)
	{
		class: "suv",
		estLifespanKM: 200000,
		generation: 3,
		make: 5,
		model: "RDX",
		seats: 5,
		size: "mid-size",
		tagline: "Athletic Luxury SUV",
		year: 2025,
	},

	// Volkswagen (make: 9)
	{
		class: "hatchback",
		estLifespanKM: 120000,
		generation: 8,
		make: 9,
		model: "Golf",
		seats: 5,
		size: "compact",
		tagline: "Das Auto",
		year: 2025,
	},

	// Ford (make: 11)
	{
		class: "sports-car",
		estLifespanKM: 150000,
		generation: 7,
		make: 11,
		model: "Mustang",
		seats: 4,
		size: "mid-size",
		tagline: "Built for the Road Ahead",
		year: 2025,
	},
	{
		class: "truck",
		estLifespanKM: 180000,
		generation: 14,
		make: 11,
		model: "F-150",
		seats: 5,
		size: "large",
		tagline: "Built Ford Tough",
		year: 2025,
	},
];

const TRIMS: CarTrim[] = [
	// Camry (car: 1)
	{
		car: 1,
		fuel: "hybrid",
		fuelEcon: 5,
		name: "SE FWD",
		price: 37625,
		transmission: "e-cvt",
		xwd: "fwd",
	},
	{
		car: 1,
		fuel: "hybrid",
		fuelEcon: 5.1,
		name: "SE Upgrade AWD",
		price: 41320,
		transmission: "e-cvt",
		xwd: "awd",
	},
	{
		car: 1,
		fuel: "hybrid",
		fuelEcon: 5.1,
		name: "XLE AWD",
		price: 48275,
		transmission: "e-cvt",
		xwd: "awd",
	},
	{
		car: 1,
		fuel: "hybrid",
		fuelEcon: 5.5,
		name: "XSE AWD",
		price: 48380,
		transmission: "e-cvt",
		xwd: "awd",
	},
	// Corolla (car: 2)
	{
		car: 2,
		fuel: "gasoline",
		fuelEcon: 6.8,
		name: "LE CVT",
		price: 27915,
		transmission: "cvt",
		xwd: "fwd",
	},
	{
		car: 2,
		fuel: "hybrid",
		fuelEcon: 5.3,
		name: "XSE AWD",
		price: 39300,
		transmission: "e-cvt",
		xwd: "awd",
	},
	// GR Corolla (car: 3)
	{
		car: 3,
		fuel: "gasoline",
		fuelEcon: 9.8,
		name: "Core",
		price: 51460,
		transmission: "manual",
		xwd: "awd",
	},
	{
		car: 3,
		fuel: "gasoline",
		fuelEcon: 9.8,
		name: "Premium MT",
		price: 59460,
		transmission: "manual",
		xwd: "awd",
	},
	{
		car: 3,
		fuel: "gasoline",
		fuelEcon: 10.5,
		name: "AT",
		price: 61680,
		transmission: "automatic",
		xwd: "awd",
	},
	// RAV4 (car: 4)
	{
		car: 4,
		fuel: "phev",
		fuelEcon: 6,
		name: "Prime XSE AWD",
		price: 59675,
		transmission: "e-cvt",
		xwd: "4wd",
	},
	// Sienna (car: 5)
	{
		car: 5,
		fuel: "hybrid",
		fuelEcon: 6.6,
		name: "XSE",
		price: 57540,
		transmission: "e-cvt",
		xwd: "fwd",
	},
	// GR86 (car: 6)
	{
		car: 6,
		fuel: "gasoline",
		fuelEcon: 10.5,
		name: "MT",
		price: 35400,
		transmission: "manual",
		xwd: "rwd",
	},
	{
		car: 6,
		fuel: "gasoline",
		fuelEcon: 10.5,
		name: "Premium MT",
		price: 38400,
		transmission: "manual",
		xwd: "rwd",
	},
	{
		car: 6,
		fuel: "gasoline",
		fuelEcon: 9.6,
		name: "Premium AT",
		price: 40365,
		transmission: "automatic",
		xwd: "rwd",
	},
	// Prius (car: 7)
	{
		car: 7,
		fuel: "hybrid",
		fuelEcon: 4.8,
		name: "XLE AWD",
		price: 41410,
		transmission: "e-cvt",
		xwd: "awd",
	},
	// RX (car: 8)
	{
		car: 8,
		fuel: "gasoline",
		fuelEcon: 10.0,
		name: "RX350 FWD",
		price: 65000,
		transmission: "automatic",
		xwd: "fwd",
	},
	{
		car: 8,
		fuel: "gasoline",
		fuelEcon: 10.5,
		name: "RX350 AWD",
		price: 68000,
		transmission: "automatic",
		xwd: "awd",
	},
	{
		car: 8,
		fuel: "hybrid",
		fuelEcon: 6.0,
		name: "RX500h+",
		price: 75000,
		transmission: "e-cvt",
		xwd: "awd",
	},
	// ES (car: 9)
	{
		car: 9,
		fuel: "gasoline",
		fuelEcon: 8.5,
		name: "ES250 AWD",
		price: 55000,
		transmission: "automatic",
		xwd: "awd",
	},
	{
		car: 9,
		fuel: "gasoline",
		fuelEcon: 8.5,
		name: "ES350",
		price: 60000,
		transmission: "automatic",
		xwd: "fwd",
	},
	// CX-5 (car: 10)
	{
		car: 10,
		fuel: "gasoline",
		fuelEcon: 8.0,
		name: "GS FWD",
		price: 32000,
		transmission: "automatic",
		xwd: "fwd",
	},
	{
		car: 10,
		fuel: "gasoline",
		fuelEcon: 8.5,
		name: "GT AWD",
		price: 38000,
		transmission: "automatic",
		xwd: "awd",
	},
	// Mazda3 (car: 11)
	{
		car: 11,
		fuel: "gasoline",
		fuelEcon: 7.5,
		name: "GS",
		price: 28000,
		transmission: "automatic",
		xwd: "fwd",
	},
	{
		car: 11,
		fuel: "gasoline",
		fuelEcon: 7.5,
		name: "GT",
		price: 32000,
		transmission: "automatic",
		xwd: "fwd",
	},
	// Civic (car: 12)
	{
		car: 12,
		fuel: "gasoline",
		fuelEcon: 7.0,
		name: "LX",
		price: 28000,
		transmission: "automatic",
		xwd: "fwd",
	},
	{
		car: 12,
		fuel: "gasoline",
		fuelEcon: 7.0,
		name: "EX",
		price: 32000,
		transmission: "automatic",
		xwd: "fwd",
	},
	{
		car: 12,
		fuel: "gasoline",
		fuelEcon: 7.5,
		name: "Sport",
		price: 30000,
		transmission: "manual",
		xwd: "fwd",
	},
	// CR-V (car: 13)
	{
		car: 13,
		fuel: "gasoline",
		fuelEcon: 8.0,
		name: "LX FWD",
		price: 32000,
		transmission: "automatic",
		xwd: "fwd",
	},
	{
		car: 13,
		fuel: "gasoline",
		fuelEcon: 8.5,
		name: "EX AWD",
		price: 38000,
		transmission: "automatic",
		xwd: "awd",
	},
	// RDX (car: 14)
	{
		car: 14,
		fuel: "gasoline",
		fuelEcon: 9.0,
		name: "Base AWD",
		price: 50000,
		transmission: "automatic",
		xwd: "awd",
	},
	{
		car: 14,
		fuel: "gasoline",
		fuelEcon: 9.0,
		name: "A-Spec",
		price: 55000,
		transmission: "automatic",
		xwd: "awd",
	},
	// Golf (car: 15)
	{
		car: 15,
		fuel: "gasoline",
		fuelEcon: 7.0,
		name: "Trendline",
		price: 28000,
		transmission: "automatic",
		xwd: "fwd",
	},
	{
		car: 15,
		fuel: "gasoline",
		fuelEcon: 7.0,
		name: "Highline",
		price: 32000,
		transmission: "automatic",
		xwd: "fwd",
	},
	// Mustang (car: 16)
	{
		car: 16,
		fuel: "gasoline",
		fuelEcon: 9.0,
		name: "EcoBoost",
		price: 35000,
		transmission: "automatic",
		xwd: "rwd",
	},
	{
		car: 16,
		fuel: "gasoline",
		fuelEcon: 12.0,
		name: "GT",
		price: 45000,
		transmission: "manual",
		xwd: "rwd",
	},
	// F-150 (car: 17)
	{
		car: 17,
		fuel: "gasoline",
		fuelEcon: 12.0,
		name: "XL 4WD",
		price: 40000,
		transmission: "automatic",
		xwd: "4wd",
	},
	{
		car: 17,
		fuel: "gasoline",
		fuelEcon: 12.0,
		name: "Lariat 4WD",
		price: 50000,
		transmission: "automatic",
		xwd: "4wd",
	},
];

await db.insert(carManufacturer).values(MAKES).execute();
await db.insert(car).values(CARS).execute();
await db.insert(carTrim).values(TRIMS).execute();

/* ACCESSORIES */
const FRONT_MATS: [Accessory, AccessoryCarXref][] = CARS.map(
	(c, i): [Accessory, AccessoryCarXref] => {
		return [
			{
				category: "mats",
				make: "WeatherTech",
				name: `Front Mats for ${c.model}`,
				price:
					c.size === "compact" ? 184.95 : c.size === "large" ? 194.95 : 189.95,
			},
			{
				accessory: i + 1,
				car: i + 1,
			},
		];
	},
);

const REAR_MATS: [Accessory, AccessoryCarXref][] = CARS.map(
	(c, i): [Accessory, AccessoryCarXref] => {
		return [
			{
				category: "mats",
				make: "WeatherTech",
				name: `Rear Mats for ${c.model}`,
				price:
					c.size === "compact" ? 154.95 : c.size === "large" ? 164.95 : 159.95,
			},
			{
				accessory: FRONT_MATS.length + i + 1,
				car: i + 1,
			},
		];
	},
);

const HOOD_DEFLECTORS: [Accessory, AccessoryCarXref][] = CARS.map(
	(c, i): [Accessory, AccessoryCarXref] => {
		return [
			{
				category: "exterior protection",
				make: MAKES[c.make - 1].name,
				name: `Hood Deflector for ${c.model} (${c.year})`,
				price:
					c.size === "compact" ? 107.99 : c.size === "large" ? 161.99 : 134.99,
			},
			{
				accessory: FRONT_MATS.length + REAR_MATS.length + i + 1,
				car: i + 1,
			},
		];
	},
);

const DASHCAMS: Accessory[] = [
	{
		category: "dashcams",
		make: "Garmin",
		name: "Economy Dashcam",
		price: 119.99,
		universal: true,
	},
	{
		category: "dashcams",
		make: "Garmin",
		name: "Premium Dashcam",
		price: 159.99,
		universal: true,
	},
];

const AIR_FRESHENERS: Accessory[] = [
	{
		category: "air fresheners",
		make: "TreeScent",
		name: " Coffee",
		price: 4.49,
		universal: true,
	},
	{
		category: "air fresheners",
		make: "TreeScent",
		name: " Citrus",
		price: 4.49,
		universal: true,
	},
	{
		category: "air fresheners",
		make: "TreeScent",
		name: "Lavender",
		price: 4.49,
		universal: true,
	},
	{
		category: "air fresheners",
		make: "TreeScent",
		name: "Ocean Breeze",
		price: 4.49,
		universal: true,
	},
	{
		category: "air fresheners",
		make: "TreeScent",
		name: " Pine",
		price: 4.49,
		universal: true,
	},
	{
		category: "air fresheners",
		make: "TreeScent",
		name: "Vanilla",
		price: 4.49,
		universal: true,
	},
];

await db.batch([
	db
		.insert(accessory)
		.values([
			...FRONT_MATS.map((x) => x[0]),
			...REAR_MATS.map((x) => x[0]),
			...HOOD_DEFLECTORS.map((x) => x[0]),
			...DASHCAMS,
			...AIR_FRESHENERS,
		]),
	db
		.insert(accessoryCarXref)
		.values([
			...FRONT_MATS.map((x) => x[1]),
			...REAR_MATS.map((x) => x[1]),
			...HOOD_DEFLECTORS.map((x) => x[1]),
		]),
]);

/* INVENTORY */
const COLORS = [
	"red",
	"green",
	"blue",
	"grey",
	"dark slate blue",
	"silver",
	"dark grey",
	"black",
	"white",
];

const CAR_INV: CarInventory[] = TRIMS.flatMap((_, idx) => {
	const inv: CarInventory[] = [];

	// random number of trims (1-8)
	const count = Math.floor(Math.random() * 8) + 1;
	for (let i = 0; i < count; i++) {
		// select random color
		const colorIndex = Math.floor(Math.random() * (COLORS.length + 1));

		// select random purchasable/rentable values (0: none, 1: rentable, 2: purchasable, 3: both)
		const rand = Math.floor(Math.random() * 4);

		inv.push({
			color: COLORS[colorIndex],
			id: crypto.randomUUID(),
			mileage: Math.floor(Math.random() * 1000),
			purchasable: (rand & 2) === 2,
			rentable: (rand & 1) === 1,
			trim: idx + 1,
		});
	}

	return inv;
});

await db.insert(carInventory).values(CAR_INV).execute();

/* ACCESSORY INVENTORY */
const ACCESSORY_INV: AccessoryInventory[] = [];
const totalAccessoriesCount =
	FRONT_MATS.length +
	REAR_MATS.length +
	HOOD_DEFLECTORS.length +
	DASHCAMS.length +
	AIR_FRESHENERS.length;
for (let accessoryId = 1; accessoryId <= totalAccessoriesCount; accessoryId++) {
	// Generate 1-20 random inventory items per accessory
	const count = Math.floor(Math.random() * 20) + 1;
	for (let i = 0; i < count; i++) {
		ACCESSORY_INV.push({
			accessory: accessoryId,
			id: crypto.randomUUID(),
		});
	}
}
await db.insert(accessoryInventory).values(ACCESSORY_INV).execute();
