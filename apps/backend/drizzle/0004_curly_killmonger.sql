ALTER TABLE `accessory_order` ADD `card_exp_month` text NOT NULL;--> statement-breakpoint
ALTER TABLE `accessory_order` ADD `card_exp_year` text NOT NULL;--> statement-breakpoint
ALTER TABLE `accessory_order` ADD `card_last4` text NOT NULL;--> statement-breakpoint
ALTER TABLE `accessory_order` ADD `shipping_address` text NOT NULL;--> statement-breakpoint
ALTER TABLE `car_order` ADD `card_exp_month` text NOT NULL;--> statement-breakpoint
ALTER TABLE `car_order` ADD `card_exp_year` text NOT NULL;--> statement-breakpoint
ALTER TABLE `car_order` ADD `card_last4` text NOT NULL;--> statement-breakpoint
ALTER TABLE `car_order` ADD `shipping_address` text NOT NULL;