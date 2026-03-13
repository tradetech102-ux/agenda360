CREATE TABLE `loanInstallments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanId` int NOT NULL,
	`installmentNumber` int NOT NULL,
	`dueDate` timestamp NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`paidAmount` decimal(12,2) DEFAULT '0',
	`status` enum('pending','paid','overdue') DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loanInstallments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loanPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`paymentType` enum('full','partial') NOT NULL,
	`paymentDate` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loanPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int NOT NULL,
	`type` enum('lent','borrowed') NOT NULL,
	`initialAmount` decimal(12,2) NOT NULL,
	`interestRate` decimal(5,2) DEFAULT '0',
	`isInstallment` boolean DEFAULT false,
	`numberOfInstallments` int,
	`frequency` varchar(50) DEFAULT 'monthly',
	`totalWithInterest` decimal(12,2),
	`totalPaid` decimal(12,2) DEFAULT '0',
	`remainingBalance` decimal(12,2),
	`status` enum('active','completed','overdue') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loans_id` PRIMARY KEY(`id`)
);
