import { maladiesTable } from "@/db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export const getAllMaladies = async () => {
  const maladies = await db.select().from(maladiesTable);
  return maladies;
};

export const getMaladiById = async (maladieId: number) => {
  const maladies = await db
    .select()
    .from(maladiesTable)
    .where(eq(maladiesTable.id, maladieId));
  return maladies;
};
export const deleteMaladie = async (data: { maladieId: number }) => {
  const res = await db
    .delete(maladiesTable)
    .where(eq(maladiesTable.id, data.maladieId));
  return res.changes;
};
export const updateMaladie = async (data: {
  maladie: typeof maladiesTable.$inferInsert;
  maladieId: number;
}) => {
  const res = await db
    .update(maladiesTable)
    .set(data.maladie)
    .where(eq(maladiesTable.id, data.maladieId));
  res.lastInsertRowId;
};
export const addMaladie = async (data: {
  maladie: typeof maladiesTable.$inferInsert;
}) => {
  const res = await db.insert(maladiesTable).values(data.maladie);
  res.lastInsertRowId;
};
