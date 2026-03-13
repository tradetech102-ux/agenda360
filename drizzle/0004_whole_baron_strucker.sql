CREATE TABLE `bankAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`bankName` varchar(255) NOT NULL,
	`accountNumber` varchar(50) NOT NULL,
	`accountType` enum('checking','savings','investment') DEFAULT 'checking',
	`balance` decimal(12,2) DEFAULT '0',
	`currency` varchar(3) DEFAULT 'BRL',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bankAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditCards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cardName` varchar(255) NOT NULL,
	`cardBrand` enum('visa','mastercard','amex','elo','other') NOT NULL,
	`cardNumber` varchar(20) NOT NULL,
	`cardHolder` varchar(255) NOT NULL,
	`expiryMonth` int,
	`expiryYear` int,
	`cvv` varchar(4),
	`creditLimit` decimal(12,2) DEFAULT '0',
	`currentBalance` decimal(12,2) DEFAULT '0',
	`dueDay` int DEFAULT 10,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creditCards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `digitalWallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletName` varchar(255) NOT NULL,
	`walletType` enum('pix','paypal','stripe','other') NOT NULL,
	`balance` decimal(12,2) DEFAULT '0',
	`currency` varchar(3) DEFAULT 'BRL',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `digitalWallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionType` enum('income','expense') NOT NULL,
	`paymentMethod` enum('cash','pix','debit','credit','transfer') NOT NULL,
	`accountId` int,
	`walletId` int,
	`creditCardId` int,
	`amount` decimal(12,2) NOT NULL,
	`description` text,
	`category` varchar(100),
	`clientId` int,
	`supplierId` int,
	`productId` int,
	`installments` int DEFAULT 1,
	`currentInstallment` int DEFAULT 1,
	`status` enum('pending','completed','cancelled') DEFAULT 'pending',
	`transactionDate` datetime NOT NULL,
	`dueDate` datetime,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installmentPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionId` int NOT NULL,
	`creditCardId` int NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`installmentAmount` decimal(12,2) NOT NULL,
	`totalInstallments` int NOT NULL,
	`currentInstallment` int DEFAULT 1,
	`interestRate` decimal(5,2) DEFAULT '0',
	`status` enum('active','completed','cancelled') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installmentPlans_id` PRIMARY KEY(`id`)
);
