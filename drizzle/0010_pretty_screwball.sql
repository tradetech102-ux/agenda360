CREATE TABLE `productFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`position` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productFavorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`salesOrderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`discount` decimal(10,2) DEFAULT '0',
	`discountType` enum('percentage','fixed') DEFAULT 'fixed',
	`subtotal` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`sellerId` int,
	`subtotal` decimal(12,2) NOT NULL,
	`discount` decimal(12,2) DEFAULT '0',
	`discountType` enum('percentage','fixed') DEFAULT 'fixed',
	`total` decimal(12,2) NOT NULL,
	`paymentMethod` enum('cash','card','pix','check','mixed') NOT NULL,
	`amountPaid` decimal(12,2) NOT NULL,
	`change` decimal(12,2) DEFAULT '0',
	`paymentStatus` enum('pending','paid','cancelled') DEFAULT 'paid',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salesOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP INDEX `notificationType` ON `notifications`;