CREATE TABLE `accessory` (
	`category` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
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
CREATE TABLE `car_order` (
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`inventory` text NOT NULL,
	`status` text DEFAULT 'rented' NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	`user` text NOT NULL,
	PRIMARY KEY(`inventory`, `user`),
	FOREIGN KEY (`inventory`) REFERENCES `car_inventory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `car` (
	`class` text NOT NULL,
	`est_lifespan_km` integer NOT NULL,
	`generation` real NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
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
	`ownership_expiry` integer,
	`status` text DEFAULT 'returned' NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	`user` text NOT NULL,
	FOREIGN KEY (`inventory`) REFERENCES `car_inventory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `car_order_active_idx` ON `car_order` (`inventory`) WHERE "car_order"."status" != 'returned';
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
CREATE UNIQUE INDEX `car_trim_car_name_unique` ON `car_trim` (`car`,`name`);
