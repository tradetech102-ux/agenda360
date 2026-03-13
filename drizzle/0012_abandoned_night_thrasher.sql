CREATE TABLE `cashBox` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` decimal(12,2) DEFAULT '0',
	`currency` varchar(3) DEFAULT 'BRL',
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cashBox_id` PRIMARY KEY(`id`),
	CONSTRAINT `cashBox_userId_unique` UNIQUE(`userId`)
);
