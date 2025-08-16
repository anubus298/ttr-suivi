import { patientsTable } from "@/db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
export const getAllPatients = async () => {
  const maladies = await db.select().from(patientsTable);
  return maladies;
};

export const deletePatient = async (data: { patientId: number }) => {
  const res = await db
    .delete(patientsTable)
    .where(eq(patientsTable.id, data.patientId));
  return res.changes;
};
export const addPatient = async (data: {
  patient: typeof patientsTable.$inferInsert;
}) => {
  const res = await db.insert(patientsTable).values(data.patient);
  res.lastInsertRowId;
};
