ALTER TABLE `tasks` ADD `type` enum('reuniao','visita','trabalho');--> statement-breakpoint
ALTER TABLE `tasks` ADD `clientId` int;