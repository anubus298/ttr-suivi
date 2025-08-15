PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_patients_inr_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`maladie_id` integer NOT NULL,
	`patient_id` integer NOT NULL,
	`value` real NOT NULL,
	`recorded_at` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_DATE) NOT NULL,
	FOREIGN KEY (`maladie_id`) REFERENCES `maladies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_patients_inr_records`("id", "maladie_id", "patient_id", "value", "recorded_at", "created_at") SELECT "id", "maladie_id", "patient_id", "value", "recorded_at", "created_at" FROM `patients_inr_records`;--> statement-breakpoint
DROP TABLE `patients_inr_records`;--> statement-breakpoint
ALTER TABLE `__new_patients_inr_records` RENAME TO `patients_inr_records`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`maladie_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_DATE) NOT NULL,
	FOREIGN KEY (`maladie_id`) REFERENCES `maladies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_patients`("id", "full_name", "maladie_id", "created_at") SELECT "id", "full_name", "maladie_id", "created_at" FROM `patients`;--> statement-breakpoint
DROP TABLE `patients`;--> statement-breakpoint
ALTER TABLE `__new_patients` RENAME TO `patients`;