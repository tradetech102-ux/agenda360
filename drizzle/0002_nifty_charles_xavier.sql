CREATE TABLE `supplierPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`supplierId` int NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`purchaseDate` datetime NOT NULL,
	`dueDate` datetime NOT NULL,
	`paymentStatus` enum('pending','paid','cancelled') DEFAULT 'pending',
	`paidDate` datetime,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supplierPurchases_id` PRIMARY KEY(`id`)
);
