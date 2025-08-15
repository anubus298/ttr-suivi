CREATE TABLE `patients_inr_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`maladie_id` integer,
	`patient_id` integer,
	`value` real NOT NULL,
	`recorded_at` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_DATE) NOT NULL,
	FOREIGN KEY (`maladie_id`) REFERENCES `maladies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `maladies` ADD `created_at` text DEFAULT (CURRENT_DATE) NOT NULL;--> statement-breakpoint
ALTER TABLE `patients` ADD `created_at` text DEFAULT (CURRENT_DATE) NOT NULL;