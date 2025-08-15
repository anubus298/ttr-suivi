import { sql } from "drizzle-orm";
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const maladiesTable = sqliteTable("maladies", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  minA: real().notNull(),
  maxB: real().notNull(),
  unit: text().notNull(),
  created_at: text()
    .notNull()
    .default(sql`(CURRENT_DATE)`),
});

export const patientsTable = sqliteTable("patients", {
  id: int().primaryKey({ autoIncrement: true }),
  full_name: text().notNull(),
  hospital_id: text(),
  maladieId: int("maladie_id")
    .references(() => maladiesTable.id)
    .notNull(),
  created_at: text()
    .notNull()
    .default(sql`(CURRENT_DATE)`),
});

export const patientsInrRecordsTable = sqliteTable("patients_inr_records", {
  id: int().primaryKey({ autoIncrement: true }),
  maladieId: int("maladie_id")
    .references(() => maladiesTable.id)
    .notNull(),
  patientId: int("patient_id")
    .references(() => patientsTable.id)
    .notNull(),
  value: real().notNull(),
  recorded_at: text().notNull(),
  created_at: text()
    .notNull()
    .default(sql`(CURRENT_DATE)`),
});
