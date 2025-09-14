import { settingsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db";

export const ApplySettings = async (data: {
  doctorName: string;
  titre: string | undefined;
}) => {
  //check if there is a row
  const existingRow = await db.select().from(settingsTable);
  console.log("existingRow length", existingRow.length);
  if (existingRow.length > 0) {
    // update
    const res = await db
      .update(settingsTable)
      .set({ doctorName: data.doctorName, title: data.titre, isAgreed: true })
      .where(eq(settingsTable.id, existingRow[0].id));
    console.log("successfully updated settings");
    return res.lastInsertRowId;
  } else {
    const res = await db.insert(settingsTable).values({
      doctorName: data.doctorName,
      title: data.titre,
      isAgreed: true,
    });
    console.log("successfully added settings for the first time");
    return res.lastInsertRowId;
  }
};

export async function checkIfAgreed() {
  const result = await db.select().from(settingsTable).limit(1);

  return result.length > 0 && result[0].isAgreed;
}

export const getSettings = async () => {
  const result = await db.select().from(settingsTable).limit(1);
  return result.length > 0 ? result[0] : null;
};
