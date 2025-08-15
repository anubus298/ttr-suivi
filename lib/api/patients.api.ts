import { patientsTable } from "@/db/schema";
import { db } from "../db";
export const getAllPatients = async () => {
  const maladies = await db.select().from(patientsTable);
  return maladies;
};
