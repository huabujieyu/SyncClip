import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { ClipList } from './components/ClipList';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { Clip, Theme } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toasts, addToast, removeToast } = useToast();
  // Store deleted clip temporarily for undo
  const [deletedClip, setDeletedClip] = useState<Clip | null>(null);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Fetch Data
  const fetchClips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getClips();
      setClips(data);
    } catch (error) {
      addToast('error', '无法连接服务器，已启用离线模式。');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchClips();
    // Poll for updates every 10 seconds (Simple Real-time simulation)
    const interval = setInterval(() => {
      if (!document.hidden) { // Only poll when visible to save resources
        api.getClips().then(data => {
          // Only update if IDs are different to prevent jitter
          setClips(prev => {
             const prevIds = prev.map(c => c.id).join(',');
             const newIds = data.map(c => c.id).join(',');
             return prevIds !== newIds ? data : prev;
          });
        }).catch(() => {}); // Silent fail on poll
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchClips]);

  // Filter clips based on search query
  const filteredClips = useMemo(() => {
    if (!searchQuery.trim()) return clips;
    const query = searchQuery.toLowerCase();
    return clips.filter(clip => 
      clip.content.toLowerCase().includes(query) || 
      (clip.note && clip.note.toLowerCase().includes(query))
    );
  }, [clips, searchQuery]);

  const handleSubmit = async (content: string, note?: string) => {
    // Optimistic Update
    const tempId = 'temp-' + Date.now();
    const optimisticClip: Clip = {
        id: tempId,
        content,
        note,
        created_at: Date.now()
    };
    
    setClips(prev => [optimisticClip, ...prev]);

    try {
      const savedClip = await api.addClip(content, note);
      // Replace optimistic clip with real one
      setClips(prev => prev.map(c => c.id === tempId ? savedClip : c));
      addToast('success', '发布成功！');
    } catch (error) {
      setClips(prev => prev.filter(c => c.id !== tempId));
      addToast('error', '发布失败。');
    }
  };

  const handleUpdate = async (id: string, content: string, note?: string) => {
    const oldClips = [...clips];
    setClips(prev => prev.map(c => c.id === id ? { ...c, content, note } : c));
    
    try {
      await api.updateClip(id, content, note);
      addToast('success', '更新成功。');
    } catch (error) {
      setClips(oldClips);
      addToast('error', '更新失败。');
    }
  };

  const handleDelete = async (id: string) => {
    const clipToDelete = clips.find(c => c.id === id);
    if (!clipToDelete) return;

    // Optimistic Delete
    setClips(prev => prev.filter(c => c.id !== id));
    setDeletedClip(clipToDelete);

    // Show Undo Toast
    addToast('info', '记录已删除。', {
      label: '撤销',
      onClick: () => handleUndoDelete(clipToDelete)
    });

    try {
      // Actually delete after a short delay (or immediately if you handle undo differently)
      await api.deleteClip(id);
    } catch (error) {
      setClips(prev => [clipToDelete, ...prev].sort((a,b) => b.created_at - a.created_at));
      addToast('error', '删除失败。');
    }
  };

  const handleUndoDelete = async (clip: Clip) => {
     // Re-add locally
     setClips(prev => [clip, ...prev].sort((a,b) => b.created_at - a.created_at));
     // Re-add to server
     try {
       await api.addClip(clip.content, clip.note);
     } catch (e) {
       console.error("Undo failed on server");
     }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
        // Success handled in ClipItem visual feedback
    }).catch(() => {
        addToast('error', '复制失败，请手动复制。');
    });
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onRefresh={fetchClips}
        isRefreshing={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4">
        <ClipList
          clips={filteredClips}
          loading={loading}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onCopy={handleCopy}
        />
      </main>

      <InputArea onSubmit={handleSubmit} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;