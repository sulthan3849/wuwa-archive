// ============================================================================
// Wuwa Archive — Export/Import System
// Native JSON format for backup and restore
// ============================================================================

import { db, type StoredPull, type StoredProfile } from './database';
import { getAllPulls, getProfile, importPulls, upsertProfile } from './operations';

// === TYPES ===

export interface WuwaArchiveExport {
  version: '1.0.0';
  app: 'wuwa-archive';
  exportedAt: string; // ISO timestamp
  profile: {
    playerUid: string;
    serverId: string;
    serverArea: string;
  };
  pulls: StoredPull[];
  totalPulls: number;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  newRecords: number;
  duplicateRecords: number;
  profile: StoredProfile | null;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
}

// === VALIDATION ===

/**
 * Validate export file format
 */
export function validateExportFile(data: unknown): ValidationResult {
  // Check if it's an object
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Invalid file format. Expected JSON object.',
      errorCode: 'INVALID_FORMAT',
    };
  }

  const obj = data as Record<string, unknown>;

  // Check app field
  if (obj.app !== 'wuwa-archive') {
    return {
      isValid: false,
      error: 'This file is not a Wuwa Archive backup.',
      errorCode: 'WRONG_APP',
    };
  }

  // Check version
  if (!obj.version) {
    return {
      isValid: false,
      error: 'Backup format not recognized. Missing version field.',
      errorCode: 'MISSING_VERSION',
    };
  }

  // Check pulls array
  if (!Array.isArray(obj.pulls)) {
    return {
      isValid: false,
      error: 'Pull data not found in file.',
      errorCode: 'MISSING_PULLS',
    };
  }

  // Validate each pull record
  for (let i = 0; i < obj.pulls.length; i++) {
    const pull = obj.pulls[i] as Record<string, unknown>;
    
    if (!pull.id || typeof pull.id !== 'string') {
      return {
        isValid: false,
        error: `Invalid pull record at index ${i}: missing or invalid id.`,
        errorCode: 'INVALID_PULL_RECORD',
      };
    }
    
    if (!pull.playerUid || typeof pull.playerUid !== 'string') {
      return {
        isValid: false,
        error: `Invalid pull record at index ${i}: missing or invalid playerUid.`,
        errorCode: 'INVALID_PULL_RECORD',
      };
    }
    
    if (typeof pull.cardPoolType !== 'number') {
      return {
        isValid: false,
        error: `Invalid pull record at index ${i}: missing or invalid cardPoolType.`,
        errorCode: 'INVALID_PULL_RECORD',
      };
    }
    
    if (typeof pull.qualityLevel !== 'number') {
      return {
        isValid: false,
        error: `Invalid pull record at index ${i}: missing or invalid qualityLevel.`,
        errorCode: 'INVALID_PULL_RECORD',
      };
    }
  }

  return { isValid: true };
}

// === EXPORT ===

/**
 * Generate export data for a player
 */
export async function generateExportData(playerUid: string): Promise<WuwaArchiveExport | null> {
  // Get profile
  const profile = await getProfile(playerUid);
  if (!profile) {
    return null;
  }

  // Get all pulls
  const pulls = await getAllPulls(playerUid);

  return {
    version: '1.0.0',
    app: 'wuwa-archive',
    exportedAt: new Date().toISOString(),
    profile: {
      playerUid: profile.playerUid,
      serverId: profile.serverId,
      serverArea: profile.serverArea,
    },
    pulls,
    totalPulls: pulls.length,
  };
}

/**
 * Export data as JSON file and trigger download
 */
export async function exportToJson(playerUid: string): Promise<{
  success: boolean;
  filename?: string;
  error?: string;
}> {
  try {
    const data = await generateExportData(playerUid);
    if (!data) {
      return {
        success: false,
        error: 'Profile not found. Please import your data first.',
      };
    }

    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);

    // Create blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wuwa-archive-pulls-${playerUid}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename: link.download,
    };
  } catch (error) {
    console.error('Export failed:', error);
    return {
      success: false,
      error: 'Failed to export data. Please try again.',
    };
  }
}

// === IMPORT ===

/**
 * Import data from a backup file
 * Handles deduplication automatically via bulkPut
 */
export async function importFromJson(file: File): Promise<ImportResult> {
  try {
    // Read file content
    const text = await file.text();

    // Parse JSON
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        totalRecords: 0,
        newRecords: 0,
        duplicateRecords: 0,
        profile: null,
        error: 'Invalid JSON format. Please check the file.',
      };
    }

    // Validate format
    const validation = validateExportFile(data);
    if (!validation.isValid) {
      return {
        success: false,
        totalRecords: 0,
        newRecords: 0,
        duplicateRecords: 0,
        profile: null,
        error: validation.error,
      };
    }

    const exportData = data as WuwaArchiveExport;

    // Count existing records before import
    const existingIds = new Set<string>();
    const existingPulls = await db.pulls
      .where('playerUid')
      .equals(exportData.profile.playerUid)
      .toArray();
    
    for (const pull of existingPulls) {
      existingIds.add(pull.id);
    }

    // Calculate duplicates
    let duplicateCount = 0;
    for (const pull of exportData.pulls) {
      if (existingIds.has(pull.id)) {
        duplicateCount++;
      }
    }

    // Import pulls (bulkPut handles upsert)
    await importPulls(exportData.pulls);

    // Update profile
    const profile: StoredProfile = {
      playerUid: exportData.profile.playerUid,
      serverId: exportData.profile.serverId,
      serverArea: exportData.profile.serverArea,
      lastImportAt: new Date().toISOString(),
      lastImportUrl: '', // Not available in export
    };
    await upsertProfile(profile);

    return {
      success: true,
      totalRecords: exportData.pulls.length,
      newRecords: exportData.pulls.length - duplicateCount,
      duplicateRecords: duplicateCount,
      profile,
    };
  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      totalRecords: 0,
      newRecords: 0,
      duplicateRecords: 0,
      profile: null,
      error: 'Failed to import data. Please check the file format.',
    };
  }
}

/**
 * Import data from JSON string (for drag-and-drop)
 */
export async function importFromJsonString(
  jsonString: string
): Promise<ImportResult> {
  try {
    // Parse JSON
    let data: unknown;
    try {
      data = JSON.parse(jsonString);
    } catch {
      return {
        success: false,
        totalRecords: 0,
        newRecords: 0,
        duplicateRecords: 0,
        profile: null,
        error: 'Invalid JSON format. Please check the file.',
      };
    }

    // Validate format
    const validation = validateExportFile(data);
    if (!validation.isValid) {
      return {
        success: false,
        totalRecords: 0,
        newRecords: 0,
        duplicateRecords: 0,
        profile: null,
        error: validation.error,
      };
    }

    const exportData = data as WuwaArchiveExport;

    // Count existing records before import
    const existingIds = new Set<string>();
    const existingPulls = await db.pulls
      .where('playerUid')
      .equals(exportData.profile.playerUid)
      .toArray();
    
    for (const pull of existingPulls) {
      existingIds.add(pull.id);
    }

    // Calculate duplicates
    let duplicateCount = 0;
    for (const pull of exportData.pulls) {
      if (existingIds.has(pull.id)) {
        duplicateCount++;
      }
    }

    // Import pulls
    await importPulls(exportData.pulls);

    // Update profile
    const profile: StoredProfile = {
      playerUid: exportData.profile.playerUid,
      serverId: exportData.profile.serverId,
      serverArea: exportData.profile.serverArea,
      lastImportAt: new Date().toISOString(),
      lastImportUrl: '',
    };
    await upsertProfile(profile);

    return {
      success: true,
      totalRecords: exportData.pulls.length,
      newRecords: exportData.pulls.length - duplicateCount,
      duplicateRecords: duplicateCount,
      profile,
    };
  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      totalRecords: 0,
      newRecords: 0,
      duplicateRecords: 0,
      profile: null,
      error: 'Failed to import data. Please check the file format.',
    };
  }
}

// === FILE SIZE VALIDATION ===

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Check if file size is within limits
 */
export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size is 10MB.`,
      errorCode: 'FILE_TOO_LARGE',
    };
  }
  return { isValid: true };
}

/**
 * Check if file extension is valid
 */
export function validateFileExtension(file: File): ValidationResult {
  const validExtensions = ['.json'];
  const fileName = file.name.toLowerCase();
  const isValid = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!isValid) {
    return {
      isValid: false,
      error: 'Only .json files are supported.',
      errorCode: 'INVALID_EXTENSION',
    };
  }
  return { isValid: true };
}
