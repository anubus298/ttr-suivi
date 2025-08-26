import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { maladiesTable } from "@/db/schema";
const expo = SQLite.openDatabaseSync("db.db");
export const db = drizzle(expo);

export async function runSeed() {
  // check if seeding already done
  const existing = await db.select().from(maladiesTable).limit(1);

  if (existing.length === 0) {
    await db.insert(maladiesTable).values([
      { name: "TVP", maxB: 3, minA: 2, unit: "" },
      { name: "Embolie pulmonaire", maxB: 3, minA: 2, unit: "" },
      {
        name: "Fibrillation auriculaire avec facteurs de risque thromboembolique",
        maxB: 3,
        minA: 2,
        unit: "",
      },
      {
        name: "Infarctus du myocarde compliqué d’un thrombus mural",
        maxB: 3,
        minA: 2,
        unit: "",
      },
      {
        name: "Dysfonction ventriculaire gauche sévère ou dyskinésie emboligène",
        maxB: 3,
        minA: 2,
        unit: "",
      },
      { name: "Valvulopathie mitrale", maxB: 4.5, minA: 3, unit: "" },
      { name: "Prothèse valvulaire mécanique", maxB: 4.5, minA: 2.5, unit: "" },
    ]);
    console.log("✅ Seed data inserted");
  } else {
    console.log("ℹ️ Seed already exists, skipping...");
  }
}
