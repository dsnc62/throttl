PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accessory_inventory` (
	`accessory` integer NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`accessory`) REFERENCES `accessory`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_accessory_inventory`("accessory", "created_at", "id") SELECT "accessory", "created_at", "id" FROM `accessory_inventory`;--> statement-breakpoint
DROP TABLE `accessory_inventory`;--> statement-breakpoint
ALTER TABLE `__new_accessory_inventory` RENAME TO `accessory_inventory`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_car_order` (
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`inventory` text NOT NULL,
	`km_driven` integer,
	`max_mileage` integer,
	`ownership_expiry` integer,
	`status` text DEFAULT 'returned' NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	`user` text NOT NULL,
	FOREIGN KEY (`inventory`) REFERENCES `car_inventory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_car_order`("created_at", "id", "inventory", "km_driven", "max_mileage", "ownership_expiry", "status", "updated_at", "user") SELECT "created_at", "id", "inventory", "km_driven", "max_mileage", "ownership_expiry", "status", "updated_at", "user" FROM `car_order`;--> statement-breakpoint
DROP TABLE `car_order`;--> statement-breakpoint
ALTER TABLE `__new_car_order` RENAME TO `car_order`;--> statement-breakpoint
CREATE UNIQUE INDEX `car_order_active_idx` ON `car_order` (`inventory`) WHERE "car_order"."status" != 'returned';--> statement-breakpoint
ALTER TABLE `accessory` ADD `image` text;--> statement-breakpoint
ALTER TABLE `car` ADD `image` text;
