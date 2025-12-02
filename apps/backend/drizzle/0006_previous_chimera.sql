CREATE TABLE `transaction` (
	`address` text NOT NULL,
	`card_exp_month` integer NOT NULL,
	`card_exp_year` integer NOT NULL,
	`card_last4` text NOT NULL,
	`city` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`postal_code` text NOT NULL,
	`province` text NOT NULL,
	`total_price` real NOT NULL,
	`user` text NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accessory_order` (
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`inventory` text NOT NULL,
	`status` text DEFAULT 'purchased' NOT NULL,
	`tx` text NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`inventory`, `tx`),
	FOREIGN KEY (`inventory`) REFERENCES `accessory_inventory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tx`) REFERENCES `transaction`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_accessory_order`("created_at", "inventory", "status", "tx", "updated_at") SELECT "created_at", "inventory", "status", "tx", "updated_at" FROM `accessory_order`;--> statement-breakpoint
DROP TABLE `accessory_order`;--> statement-breakpoint
ALTER TABLE `__new_accessory_order` RENAME TO `accessory_order`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_car_order` (
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`inventory` text NOT NULL,
	`km_driven` integer,
	`max_mileage` integer,
	`order_type` text NOT NULL,
	`ownership_expiry` integer,
	`status` text DEFAULT 'returned' NOT NULL,
	`tx` text NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`inventory`) REFERENCES `car_inventory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tx`) REFERENCES `transaction`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_car_order`("created_at", "id", "inventory", "km_driven", "max_mileage", "order_type", "ownership_expiry", "status", "tx", "updated_at") SELECT "created_at", "id", "inventory", "km_driven", "max_mileage", "order_type", "ownership_expiry", "status", "tx", "updated_at" FROM `car_order`;--> statement-breakpoint
DROP TABLE `car_order`;--> statement-breakpoint
ALTER TABLE `__new_car_order` RENAME TO `car_order`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_order_active_idx` ON `car_order` (`inventory`) WHERE "car_order"."status" != 'returned';--> statement-breakpoint
CREATE TABLE `__new_car_purchase_details` (
	`annual_km` integer,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`freq` text,
	`id` text PRIMARY KEY NOT NULL,
	`order` text NOT NULL,
	`purchase_type` text NOT NULL,
	`rate` real,
	`term` integer,
	`total_price` real NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`order`) REFERENCES `car_order`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_car_purchase_details`("annual_km", "created_at", "freq", "id", "order", "purchase_type", "rate", "term", "total_price", "updated_at") SELECT "annual_km", "created_at", "freq", "id", "order", "purchase_type", "rate", "term", "total_price", "updated_at" FROM `car_purchase_details`;--> statement-breakpoint
DROP TABLE `car_purchase_details`;--> statement-breakpoint
ALTER TABLE `__new_car_purchase_details` RENAME TO `car_purchase_details`;