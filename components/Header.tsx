import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, ClipboardList, RefreshCw, Search, X } from 'lucide-react';
import { Theme } from '../types';
import { Button } from './ui/Button';
import { cn } from '../utils';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  theme, 
  toggleTheme, 
  onRefresh, 
  isRefreshing,
  searchQuery,
  setSearchQuery
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        
        {/* Search Mode */}
        {isSearchOpen ? (
          <div className="flex-1 flex items-center gap-2 animate-fade-in">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索内容或备注..."
                className="w-full bg-gray-100 dark:bg-dark-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <Button size="icon" variant="ghost" onClick={handleCloseSearch} title="关闭搜索">
              <X size={20} />
            </Button>
          </div>
        ) : (
          /* Normal Mode */
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-gradient-to-tr from-primary-500 to-primary-700 p-2 rounded-lg text-white shadow-lg shadow-primary-500/30 shrink-0">
                <ClipboardList size={24} />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 truncate">
                SyncClip
              </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="搜索"
              >
                <Search size={20} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                className={cn("rounded-full text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400", isRefreshing && "animate-spin text-primary-500")}
                aria-label="刷新"
                disabled={isRefreshing}
              >
                <RefreshCw size={20} />
              </Button>

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
                aria-label="切换主题"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};