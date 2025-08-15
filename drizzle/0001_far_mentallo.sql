CREATE TABLE `maladies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`minA` real NOT NULL,
	`maxB` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`maladie_id` integer,
	FOREIGN KEY (`maladie_id`) REFERENCES `maladies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `users_table`;