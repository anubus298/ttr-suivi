import { maladiesTable, patientsTable } from "@/db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
export const getPatientById = async (userId: number) => {
  return await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.id, userId));
};
export const getAllPatients = async () => {
  const maladies = await db
    .select({
      id: patientsTable.id,
      full_name: patientsTable.full_name,
      hospital_id: patientsTable.hospital_id,
      maladieName: maladiesTable.name,
      maladieId: maladiesTable.id,
      created_at: patientsTable.created_at,
      minA: maladiesTable.minA,
      maxB: maladiesTable.maxB,
      unit: maladiesTable.unit,
    })
    .from(patientsTable)
    .innerJoin(maladiesTable, eq(patientsTable.maladieId, maladiesTable.id));
  return maladies;
};

export const deletePatient = async (data: { patientId: number }) => {
  const res = await db
    .delete(patientsTable)
    .where(eq(patientsTable.id, data.patientId));
  return res.changes;
};
export const updatePatient = async (data: {
  patient: typeof patientsTable.$inferInsert;
  patientId: number;
}) => {
  const res = await db
    .update(patientsTable)
    .set(data.patient)
    .where(eq(patientsTable.id, data.patientId));
  res.lastInsertRowId;
};
export const addPatient = async (data: {
  patient: typeof patientsTable.$inferInsert;
}) => {
  const res = await db.insert(patientsTable).values(data.patient);
  res.lastInsertRowId;
};
