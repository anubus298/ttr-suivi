import { maladiesTable } from "@/db/schema";
import { db } from "../db";

export const getAllMaladies = async () => {
  const maladies = await db.select().from(maladiesTable);
  return maladies;
};
