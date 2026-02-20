/**
 * ARCO Data Export - JSON Format
 *
 * Handles JSON export functionality for ACCESS requests
 */

import type { DataTableScope } from '@/types/arco'
import { getUserDataExport } from './core'

/**
 * Export user data as JSON
 *
 * @param userId - User ID
 * @param scope - Data tables to include
 * @returns JSON string of user data
 */
export async function exportUserDataToJson(
  userId: string,
  scope: DataTableScope[] = ['all']
): Promise<string> {
  const dataPackage = await getUserDataExport(userId, scope)
  return JSON.stringify(dataPackage, null, 2)
}

/**
 * Export a single data table to JSON
 *
 * @param tableName - Name of the table to export
 * @param data - Table data
 * @returns JSON string
 */
export function exportTableToJson(
  tableName: string,
  data: Array<Record<string, unknown>>
): string {
  const exportObj = {
    table_name: tableName,
    exported_at: new Date().toISOString(),
    record_count: data.length,
    records: data,
  }
  return JSON.stringify(exportObj, null, 2)
}

/**
 * Export multiple tables to JSON
 *
 * @param tables - Object with table names and their data
 * @returns JSON string
 */
export function exportTablesToJson(
  tables: Record<string, Array<Record<string, unknown>>>
): string {
  const exportObj: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    tables: {},
  }

  for (const [tableName, data] of Object.entries(tables)) {
    ;(exportObj.tables as Record<string, unknown>)[tableName] = {
      record_count: data.length,
      records: data,
    }
  }

  return JSON.stringify(exportObj, null, 2)
}

/**
 * Parse and validate JSON export
 *
 * @param jsonString - JSON string to parse
 * @returns Parsed data or null if invalid
 */
export function parseJsonExport(
  jsonString: string
): Record<string, unknown> | null {
  try {
    return JSON.parse(jsonString) as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Validate JSON export format
 *
 * @param data - Parsed JSON data
 * @returns True if valid export format
 */
export function isValidExportFormat(data: Record<string, unknown>): boolean {
  if (!data || typeof data !== 'object') return false

  // Check for required fields
  const hasMetadata = 'export_metadata' in data
  const hasProfile = 'user_profile' in data

  return hasMetadata && hasProfile
}

/**
 * Extract statistics from JSON export
 *
 * @param jsonString - JSON export string
 * @returns Statistics object or null if invalid
 */
export function getExportStats(jsonString: string): {
  totalRecords: number
  dataTypes: string[]
  exportDate: string
} | null {
  const data = parseJsonExport(jsonString)
  if (!data || !isValidExportFormat(data)) return null

  const metadata = data.export_metadata as Record<string, unknown> | undefined
  const dataScope = metadata?.data_scope as string[] | undefined

  return {
    totalRecords: (metadata?.total_records as number) ?? 0,
    dataTypes: dataScope || [],
    exportDate: (metadata?.exported_at as string) ?? '',
  }
}
