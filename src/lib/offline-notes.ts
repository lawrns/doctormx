/**
 * Offline Consultation Notes System
 * Stores consultation notes locally when offline, syncs when connection returns
 */

interface OfflineNote {
  id: string;
  appointmentId: string;
  patientId: string;
  content: string;
  type: 'soap' | 'followup' | 'prescription';
  createdAt: number;
  synced: boolean;
  retryCount: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingCount: number;
  syncing: boolean;
}

class OfflineConsultationNotes {
  private readonly STORAGE_KEY = 'doctor_mx_offline_notes';
  private readonly SYNC_STATUS_KEY = 'doctor_mx_sync_status';
  private syncCallbacks: Array<(status: SyncStatus) => void> = [];

  // Get all offline notes
  getNotes(): OfflineNote[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Save a note for later sync
  saveNote(note: Omit<OfflineNote, 'id' | 'createdAt' | 'synced' | 'retryCount'>): OfflineNote {
    const notes = this.getNotes();
    const newNote: OfflineNote = {
      ...note,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      synced: false,
      retryCount: 0
    };
    
    notes.push(newNote);
    this.persistNotes(notes);
    this.notifySyncStatusChange();
    
    // Attempt immediate sync if online
    if (this.isOnline()) {
      this.syncNotes();
    }
    
    return newNote;
  }

  // Update an existing note
  updateNote(id: string, updates: Partial<OfflineNote>): OfflineNote | null {
    const notes = this.getNotes();
    const index = notes.findIndex(n => n.id === id);
    
    if (index === -1) return null;
    
    notes[index] = { ...notes[index], ...updates, synced: false };
    this.persistNotes(notes);
    this.notifySyncStatusChange();
    
    return notes[index];
  }

  // Delete a note
  deleteNote(id: string): boolean {
    const notes = this.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    
    if (filtered.length === notes.length) return false;
    
    this.persistNotes(filtered);
    this.notifySyncStatusChange();
    return true;
  }

  // Get notes for a specific appointment
  getNotesByAppointment(appointmentId: string): OfflineNote[] {
    return this.getNotes().filter(n => n.appointmentId === appointmentId);
  }

  // Get unsynced notes
  getPendingNotes(): OfflineNote[] {
    return this.getNotes().filter(n => !n.synced);
  }

  // Check if online
  isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    if (typeof window === 'undefined') {
      return { isOnline: true, lastSync: null, pendingCount: 0, syncing: false };
    }
    
    const stored = localStorage.getItem(this.SYNC_STATUS_KEY);
    const status: Partial<SyncStatus> = stored ? JSON.parse(stored) : {};
    const pendingNotes = this.getPendingNotes();
    
    return {
      isOnline: this.isOnline(),
      lastSync: status.lastSync || null,
      pendingCount: pendingNotes.length,
      syncing: status.syncing || false
    };
  }

  // Sync notes with server
  async syncNotes(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline()) {
      return { success: 0, failed: 0 };
    }

    const pending = this.getPendingNotes();
    if (pending.length === 0) {
      return { success: 0, failed: 0 };
    }

    this.setSyncing(true);
    let success = 0;
    let failed = 0;

    for (const note of pending) {
      try {
        const response = await fetch('/api/consultation-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: note.appointmentId,
            patientId: note.patientId,
            content: note.content,
            type: note.type
          })
        });

        if (response.ok) {
          this.updateNote(note.id, { synced: true });
          success++;
        } else {
          throw new Error('Sync failed');
        }
      } catch (error) {
        const retryCount = note.retryCount + 1;
        if (retryCount > 5) {
          // Max retries reached, keep for manual review
          this.updateNote(note.id, { retryCount });
        } else {
          this.updateNote(note.id, { retryCount });
        }
        failed++;
      }
    }

    this.setSyncing(false);
    this.setLastSync(Date.now());
    this.notifySyncStatusChange();

    return { success, failed };
  }

  // Subscribe to sync status changes
  onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }

  // Setup online/offline listeners
  setupListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.notifySyncStatusChange();
      this.syncNotes();
    });

    window.addEventListener('offline', () => {
      this.notifySyncStatusChange();
    });
  }

  // Private helper methods
  private persistNotes(notes: OfflineNote[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
  }

  private setSyncing(syncing: boolean): void {
    if (typeof window === 'undefined') return;
    const status = this.getSyncStatus();
    localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify({
      ...status,
      syncing
    }));
  }

  private setLastSync(timestamp: number): void {
    if (typeof window === 'undefined') return;
    const status = this.getSyncStatus();
    localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify({
      ...status,
      lastSync: timestamp
    }));
  }

  private notifySyncStatusChange(): void {
    const status = this.getSyncStatus();
    this.syncCallbacks.forEach(cb => cb(status));
  }
}

// Export singleton instance
export const offlineNotes = new OfflineConsultationNotes();

// React hook for offline status
export function useOfflineNotes() {
  // This would be implemented in a React component
  // For now, return the singleton methods
  return {
    saveNote: offlineNotes.saveNote.bind(offlineNotes),
    getNotes: offlineNotes.getNotes.bind(offlineNotes),
    getSyncStatus: offlineNotes.getSyncStatus.bind(offlineNotes),
    syncNotes: offlineNotes.syncNotes.bind(offlineNotes),
    isOnline: offlineNotes.isOnline.bind(offlineNotes)
  };
}

