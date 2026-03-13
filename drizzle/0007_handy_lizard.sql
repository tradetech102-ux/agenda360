CREATE TABLE `teamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`userId` int NOT NULL,
	`memberRole` enum('admin','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teamMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teamMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assignedTo` int NOT NULL,
	`startDate` timestamp,
	`dueDate` timestamp NOT NULL,
	`taskStatus` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamTasks_id` PRIMARY KEY(`id`)
);
