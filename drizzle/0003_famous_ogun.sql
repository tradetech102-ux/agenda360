CREATE TABLE `productOutputHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`clientId` int,
	`outputDate` datetime NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productOutputHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `cost` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `code` varchar(100);--> statement-breakpoint
ALTER TABLE `products` ADD `measure` varchar(50);--> statement-breakpoint
ALTER TABLE `products` ADD `unit` varchar(50);--> statement-breakpoint
ALTER TABLE `products` ADD `weight` decimal(10,3);--> statement-breakpoint
ALTER TABLE `products` ADD `markup` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `products` ADD `marginPercentage` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_code_unique` UNIQUE(`code`);