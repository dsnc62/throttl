CREATE TABLE `accessory` (
	`category` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`image` text,
	`make` text NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`universal` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `accessory_car_xref` (
	`accessory` integer NOT NULL,
	`car` integer NOT NULL,
	PRIMARY KEY(`accessory`, `car`),
	FOREIGN KEY (`accessory`) REFERENCES `accessory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`car`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `accessory_inventory` (
	`accessory` integer NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`discarded` integer DEFAULT false,
	`id` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`accessory`) REFERENCES `accessory`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `accessory_order` (
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
CREATE TABLE `account` (
	`access_token` text,
	`access_token_expires_at` integer,
	`account_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`id_token` text,
	`password` text,
	`provider_id` text NOT NULL,
	`refresh_token` text,
	`refresh_token_expires_at` integer,
	`scope` text,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`impersonated_by` text,
	`ip_address` text,
	`token` text NOT NULL,
	`updated_at` integer NOT NULL,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`address` text,
	`ban_expires` integer,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`card_exp_month` integer,
	`card_exp_year` integer,
	`card_number` text,
	`city` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`image` text,
	`name` text NOT NULL,
	`postal_code` text,
	`province` text,
	`role` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `car` (
	`class` text NOT NULL,
	`est_lifespan_km` integer NOT NULL,
	`generation` real NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`image` text,
	`make` integer NOT NULL,
	`model` text NOT NULL,
	`seats` integer NOT NULL,
	`size` text,
	`tagline` text,
	`website` text,
	`year` integer NOT NULL,
	FOREIGN KEY (`make`) REFERENCES `car_manufacturer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_year_make_model_unique` ON `car` (`year`,`make`,`model`);--> statement-breakpoint
CREATE TABLE `car_borrow_rate` (
	`car` integer NOT NULL,
	`duration_months` integer,
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`car`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `car_inventory` (
	`color` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`mileage` integer DEFAULT 0 NOT NULL,
	`purchasable` integer NOT NULL,
	`rentable` integer NOT NULL,
	`trim` integer NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`trim`) REFERENCES `car_trim`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `car_manufacturer` (
	`country` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`website` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `car_order` (
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
CREATE UNIQUE INDEX `car_order_active_idx` ON `car_order` (`inventory`) WHERE "car_order"."status" != 'returned';--> statement-breakpoint
CREATE TABLE `car_purchase_details` (
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
CREATE TABLE `car_trim` (
	`car` integer NOT NULL,
	`fuel` text NOT NULL,
	`fuel_econ` real NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`transmission` text NOT NULL,
	`xwd` text NOT NULL,
	FOREIGN KEY (`car`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_trim_car_name_unique` ON `car_trim` (`car`,`name`);--> statement-breakpoint
CREATE TABLE `transaction` (
	`address` text NOT NULL,
	`card_exp_month` integer NOT NULL,
	`card_exp_year` integer NOT NULL,
	`card_number` text NOT NULL,
	`city` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`postal_code` text NOT NULL,
	`province` text NOT NULL,
	`total_price` real NOT NULL,
	`user` text NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
