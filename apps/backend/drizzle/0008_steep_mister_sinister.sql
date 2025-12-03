ALTER TABLE `transaction` RENAME COLUMN "card_last4" TO "card_number";--> statement-breakpoint
ALTER TABLE `user` ADD `address` text;--> statement-breakpoint
ALTER TABLE `user` ADD `card_exp_month` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `card_exp_year` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `card_number` text;--> statement-breakpoint
ALTER TABLE `user` ADD `city` text;--> statement-breakpoint
ALTER TABLE `user` ADD `postal_code` text;--> statement-breakpoint
ALTER TABLE `user` ADD `province` text;