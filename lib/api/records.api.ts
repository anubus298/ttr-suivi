import { patientsInrRecordsTable } from "@/db/schema";
import { db } from "../db";
import { eq, and } from "drizzle-orm";
export const getAllRecordsByUserAMaladieID = async (
  userid: number,
  maladieId: number,
) => {
  const maladies = await db
    .select()
    .from(patientsInrRecordsTable)
    .where(
      and(
        eq(patientsInrRecordsTable.patientId, userid),
        eq(patientsInrRecordsTable.maladieId, maladieId),
      ),
    );
  return maladies;
};

export const deleteRecord = async (data: { recordId: number }) => {
  const res = await db
    .delete(patientsInrRecordsTable)
    .where(eq(patientsInrRecordsTable.id, data.recordId));
  return res.changes;
};
export const updateRecord = async (data: {
  record: typeof patientsInrRecordsTable.$inferInsert;
  recordId: number;
}) => {
  const res = await db
    .update(patientsInrRecordsTable)
    .set(data.record)
    .where(eq(patientsInrRecordsTable.id, data.recordId));
  res.lastInsertRowId;
};
export const addRecord = async (data: {
  record: typeof patientsInrRecordsTable.$inferInsert;
}) => {
  const res = await db.insert(patientsInrRecordsTable).values(data.record);
  res.lastInsertRowId;
};
