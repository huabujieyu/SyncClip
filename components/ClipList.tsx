import React, { useEffect, useState, useMemo } from 'react';
import { Clip } from '../types';
import { ClipItem } from './ClipItem';
import { Loader2, Inbox } from 'lucide-react';

interface ClipListProps {
  clips: Clip[];
  loading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string, note?: string) => Promise<void>;
  onCopy: (content: string) => void;
}

export const ClipList: React.FC<ClipListProps> = ({ clips, loading, onDelete, onUpdate, onCopy }) => {
  const [displayedClips, setDisplayedClips] = useState<Clip[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when clips change (e.g., new submission)
  useEffect(() => {
    setDisplayedClips(clips.slice(0, page * itemsPerPage));
  }, [clips, page]);

  // Infinite scroll simulation
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
      if (displayedClips.length < clips.length) {
        setPage(prev => prev + 1);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedClips, clips]);

  if (loading && clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>正在同步内容...</p>
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-fade-in">
        <div className="bg-gray-100 dark:bg-dark-800 p-6 rounded-full mb-4">
          <Inbox size={48} className="text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">暂无记录</h3>
        <p className="text-sm mt-2">在下方输入内容开始使用。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
      {displayedClips.map((clip) => (
        <ClipItem
          key={clip.id}
          clip={clip}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onCopy={onCopy}
        />
      ))}
      {displayedClips.length < clips.length && (
        <div className="col-span-full flex justify-center py-4">
            <Loader2 className="animate-spin text-primary-500" />
        </div>
      )}
    </div>
  );
};