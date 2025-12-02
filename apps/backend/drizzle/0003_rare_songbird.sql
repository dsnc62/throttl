CREATE TABLE `car_purchase_details` (
	`annual_km` integer,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`freq` integer,
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
ALTER TABLE `car_order` ADD `order_type` text NOT NULL;
