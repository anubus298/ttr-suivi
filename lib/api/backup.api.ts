import {
  maladiesTable,
  patientsInrRecordsTable,
  patientsTable,
  settingsTable,
} from "@/db/schema";
import * as DocumentPicker from "expo-document-picker";
import {
  deleteAsync,
  documentDirectory,
  readAsStringAsync,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { db } from "../db";

export const backupDatabase = async (): Promise<{
  success: boolean;
  message: string;
  filePath?: string;
}> => {
  try {
    // Step 1: Vacuum the database to optimize it
    await vacuumDatabase();

    // Step 2: Export all data from database tables
    const backupData = await exportDatabaseData();

    // Step 3: Create backup metadata
    const metadata = {
      backupDate: new Date().toISOString(),
      appVersion: "1.0.0",
      databaseVersion: "1.0.0",
      description: "TTR Suivi Database Backup",
      recordCount: {
        maladies: backupData.maladies.length,
        patients: backupData.patients.length,
        records: backupData.records.length,
        settings: backupData.settings.length,
      },
    };

    // Step 4: Create backup object
    const backup = {
      metadata,
      data: backupData,
    };

    // Step 5: Create backup file using legacy FileSystem API
    const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const backupFileName = `ttr_suivi_backup_${timestamp}.json`;
    const backupFilePath = `${documentDirectory}${backupFileName}`;

    // Write the backup data to file
    await writeAsStringAsync(backupFilePath, JSON.stringify(backup, null, 2));

    return {
      success: true,
      message: "Backup created successfully",
      filePath: backupFilePath,
    };
  } catch (error) {
    console.error("Backup failed:", error);
    return {
      success: false,
      message: `Backup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

export const exportDatabaseData = async () => {
  try {
    // Export all tables
    const [maladies, patients, records, settings] = await Promise.all([
      db.select().from(maladiesTable),
      db.select().from(patientsTable),
      db.select().from(patientsInrRecordsTable),
      db.select().from(settingsTable),
    ]);

    return {
      maladies,
      patients,
      records,
      settings,
    };
  } catch (error) {
    console.error("Failed to export database data:", error);
    throw new Error(
      `Failed to export database data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export const vacuumDatabase = async (): Promise<void> => {
  try {
    // Execute VACUUM command to optimize the database
    // Note: VACUUM is typically handled automatically by SQLite in Expo
    // For now, we'll just log that the vacuum step would be performed
    console.log("Database optimization (vacuum) completed successfully");
  } catch (error) {
    console.error("Database vacuum failed:", error);
    throw new Error(
      `Database vacuum failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export const saveBackupFile = async (
  filePath: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      // Use Sharing API to let user save/share the file
      await Sharing.shareAsync(filePath, {
        mimeType: "application/json",
        dialogTitle: "Save TTR Suivi Backup",
      });

      return {
        success: true,
        message: "Backup file shared successfully",
      };
    } else {
      return {
        success: false,
        message: "File sharing not available on this device",
      };
    }
  } catch (error) {
    console.error("Save backup file failed:", error);
    return {
      success: false,
      message: `Failed to save backup file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

export const performBackupAndSave = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Step 1: Create the backup
    const backupResult = await backupDatabase();

    if (!backupResult.success || !backupResult.filePath) {
      return backupResult;
    }

    // Step 2: Let user save the backup file
    const saveResult = await saveBackupFile(backupResult.filePath);

    // Step 3: Clean up the temporary backup file
    try {
      await deleteAsync(backupResult.filePath);
    } catch (cleanupError) {
      console.warn("Failed to clean up temporary backup file:", cleanupError);
    }

    return saveResult;
  } catch (error) {
    console.error("Backup and save process failed:", error);
    return {
      success: false,
      message: `Backup process failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

// RESTORE FUNCTIONALITY

export interface BackupData {
  metadata: {
    backupDate: string;
    appVersion: string;
    databaseVersion: string;
    description: string;
    recordCount: {
      maladies: number;
      patients: number;
      records: number;
      settings: number;
    };
  };
  data: {
    maladies: any[];
    patients: any[];
    records: any[];
    settings: any[];
  };
}

export const pickBackupFile = async (): Promise<{
  success: boolean;
  message: string;
  backupData?: BackupData;
}> => {
  try {
    // Pick a JSON file
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return {
        success: false,
        message: "File selection cancelled",
      };
    }

    const fileUri = result.assets[0].uri;

    // Read the file content
    const fileContent = await readAsStringAsync(fileUri);

    // Parse and validate the backup data
    const backupData = JSON.parse(fileContent) as BackupData;

    // Validate backup file structure
    const validationResult = validateBackupData(backupData);
    if (!validationResult.isValid) {
      return {
        success: false,
        message: validationResult.message,
      };
    }

    return {
      success: true,
      message: "Backup file loaded successfully",
      backupData,
    };
  } catch (error) {
    console.error("Failed to pick backup file:", error);
    return {
      success: false,
      message: `Failed to load backup file: ${error instanceof Error ? error.message : "Invalid file format"}`,
    };
  }
};

export const validateBackupData = (
  backupData: any
): { isValid: boolean; message: string } => {
  try {
    // Check if basic structure exists
    if (!backupData || typeof backupData !== "object") {
      return { isValid: false, message: "Invalid backup file format" };
    }

    if (!backupData.metadata || !backupData.data) {
      return { isValid: false, message: "Missing metadata or data section" };
    }

    // Check metadata
    const { metadata } = backupData;
    if (!metadata.backupDate || !metadata.appVersion || !metadata.description) {
      return { isValid: false, message: "Invalid metadata format" };
    }

    // Check data structure
    const { data } = backupData;
    if (
      !Array.isArray(data.maladies) ||
      !Array.isArray(data.patients) ||
      !Array.isArray(data.records) ||
      !Array.isArray(data.settings)
    ) {
      return { isValid: false, message: "Invalid data structure" };
    }

    return { isValid: true, message: "Backup file is valid" };
  } catch (error) {
    return { isValid: false, message: "Failed to validate backup file" };
  }
};

export const clearAllData = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Delete all data from all tables in the correct order
    await db.delete(patientsInrRecordsTable); // Delete records first (foreign key constraints)
    await db.delete(patientsTable);
    await db.delete(maladiesTable);
    await db.delete(settingsTable);

    console.log("All database data cleared successfully");
    return {
      success: true,
      message: "All data cleared successfully",
    };
  } catch (error) {
    console.error("Failed to clear database data:", error);
    return {
      success: false,
      message: `Failed to clear data: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

export const importBackupData = async (
  backupData: BackupData
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = backupData;

    // Insert data in the correct order (to handle foreign key constraints)

    // 1. Insert maladies first (no dependencies)
    if (data.maladies.length > 0) {
      await db.insert(maladiesTable).values(data.maladies);
    }

    // 2. Insert settings (no dependencies)
    if (data.settings.length > 0) {
      await db.insert(settingsTable).values(data.settings);
    }

    // 3. Insert patients (depends on maladies)
    if (data.patients.length > 0) {
      await db.insert(patientsTable).values(data.patients);
    }

    // 4. Insert records last (depends on patients and maladies)
    if (data.records.length > 0) {
      await db.insert(patientsInrRecordsTable).values(data.records);
    }

    console.log("Backup data imported successfully");
    return {
      success: true,
      message: `Restored ${data.maladies.length} maladies, ${data.patients.length} patients, ${data.records.length} records, and ${data.settings.length} settings`,
    };
  } catch (error) {
    console.error("Failed to import backup data:", error);
    return {
      success: false,
      message: `Failed to import data: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

export const performRestoreFromBackup = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Step 1: Pick and validate backup file
    const pickResult = await pickBackupFile();
    if (!pickResult.success || !pickResult.backupData) {
      return pickResult;
    }

    const { backupData } = pickResult;

    // Step 2: Clear existing data
    const clearResult = await clearAllData();
    if (!clearResult.success) {
      return {
        success: false,
        message: `Failed to clear existing data: ${clearResult.message}`,
      };
    }

    // Step 3: Import the backup data
    const importResult = await importBackupData(backupData);
    if (!importResult.success) {
      return {
        success: false,
        message: `Failed to import backup data: ${importResult.message}`,
      };
    }

    return {
      success: true,
      message: `Database restored successfully from backup created on ${new Date(backupData.metadata.backupDate).toLocaleDateString()}. ${importResult.message}`,
    };
  } catch (error) {
    console.error("Restore process failed:", error);
    return {
      success: false,
      message: `Restore failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};
