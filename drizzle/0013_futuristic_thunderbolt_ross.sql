CREATE TABLE `expenseCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameLower` varchar(100) NOT NULL,
	`icon` varchar(50) DEFAULT 'tag',
	`color` varchar(7) DEFAULT '#7c3aed',
	`usageCount` int DEFAULT 0,
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenseCategories_id` PRIMARY KEY(`id`)
);
