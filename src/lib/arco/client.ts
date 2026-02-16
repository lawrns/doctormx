/**
 * ARCO Client-Safe Utilities
 *
 * Pure utility functions that can be safely used in client components.
 * These functions don't depend on any server-side modules.
 *
 * @module arco/client
 */

import type { ArcoRequestStatus, ArcoRequestType } from '@/types/arco'

/**
 * Get the status badge color for UI display
 *
 * @param status - ARCO request status
 * @returns CSS color class
 */
export function getStatusColor(status: ArcoRequestStatus): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    acknowledged: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    info_required: 'bg-orange-100 text-orange-800',
    escalated: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  return colors[status] || colors.pending
}

/**
 * Get the priority badge color for UI display
 *
 * @param priority - ARCO request priority
 * @returns CSS color class
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }

  return colors[priority] || colors.normal
}

/**
 * Format ARCO request type for display
 *
 * @param requestType - ARCO request type
 * @returns Formatted type name
 */
export function formatRequestType(requestType: ArcoRequestType): string {
  const types = {
    ACCESS: 'Acceso',
    RECTIFY: 'Rectificación',
    CANCEL: 'Cancelación',
    OPPOSE: 'Oposición',
  }

  return types[requestType] || requestType
}
