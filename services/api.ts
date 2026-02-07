import { Clip, ApiResponse } from '../types';
import { generateId } from '../utils';

// Local storage key for fallback/offline mode
const STORAGE_KEY = 'syncclip_data';

// Determine if we are in a real deployment or local dev without backend
// Defaults to false to attempt API connection, but falls back gracefully.
const USE_LOCAL_STORAGE = false;

// Helper to access local storage safely
const getLocalClips = (): Clip[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading from local storage', e);
    return [];
  }
};

const setLocalClips = (clips: Clip[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
  } catch (e) {
    console.error('Error writing to local storage', e);
  }
};

export const api = {
  async getClips(): Promise<Clip[]> {
    if (USE_LOCAL_STORAGE) {
      return getLocalClips();
    }
    try {
      const res = await fetch('/api/clips');
      
      // Handle non-200 responses or HTML responses (common in SPA dev servers for unknown routes)
      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error(`API unavailable: ${res.status}`);
      }

      const json: ApiResponse<Clip[]> = await res.json();
      
      if (!json.success) {
        throw new Error(json.error || 'Unknown API error');
      }

      // Sync successful fetch to local storage for offline capability next time
      const data = json.data || [];
      setLocalClips(data);
      return data;
    } catch (e) {
      console.warn('API fetch failed, falling back to local storage.', e);
      return getLocalClips();
    }
  },

  async addClip(content: string, note?: string): Promise<Clip> {
    const newClip: Clip = {
      id: generateId(),
      content,
      note,
      created_at: Date.now(),
    };

    // Always update local storage immediately for perceived performance and fallback
    const currentClips = getLocalClips();
    setLocalClips([newClip, ...currentClips]);

    if (USE_LOCAL_STORAGE) {
      return newClip;
    }

    try {
      const res = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClip),
      });

      if (!res.ok) throw new Error(`Failed to save: ${res.status}`);
      
      // If server generates metadata, we might want to fetch here, but we are generating ID client-side.
      return newClip;
    } catch (e) {
      console.warn('API save failed, using local version.', e);
      // We already saved to local storage above, so just return the clip.
      return newClip;
    }
  },

  async updateClip(id: string, content: string, note?: string): Promise<void> {
    // Optimistic update local
    const clips = getLocalClips();
    const updated = clips.map(c => c.id === id ? { ...c, content, note } : c);
    setLocalClips(updated);

    if (USE_LOCAL_STORAGE) return;

    try {
      const res = await fetch(`/api/clips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, note }),
      });
      if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
    } catch (e) {
      console.warn('API update failed, kept local change.', e);
    }
  },

  async deleteClip(id: string): Promise<void> {
    // Optimistic delete local
    const clips = getLocalClips();
    const updated = clips.filter(c => c.id !== id);
    setLocalClips(updated);

    if (USE_LOCAL_STORAGE) return;

    try {
      const res = await fetch(`/api/clips/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
    } catch (e) {
      console.warn('API delete failed, kept local change.', e);
    }
  }
};