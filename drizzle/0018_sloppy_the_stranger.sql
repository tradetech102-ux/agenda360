ALTER TABLE `tasks` ADD `clientId` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `actionType` enum('reuniao','visita','trabalho');