PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	`user` text NOT NULL,
	FOREIGN KEY (`order`) REFERENCES `car_order`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_car_purchase_details`("annual_km", "created_at", "freq", "id", "order", "purchase_type", "rate", "term", "total_price", "updated_at", "user") SELECT "annual_km", "created_at", "freq", "id", "order", "purchase_type", "rate", "term", "total_price", "updated_at", "user" FROM `car_purchase_details`;--> statement-breakpoint
DROP TABLE `car_purchase_details`;--> statement-breakpoint
ALTER TABLE `__new_car_purchase_details` RENAME TO `car_purchase_details`;--> statement-breakpoint
PRAGMA foreign_keys=ON;