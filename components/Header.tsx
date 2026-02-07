import React from 'react';
import { Moon, Sun, ClipboardList } from 'lucide-react';
import { Theme } from '../types';
import { Button } from './ui/Button';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-primary-500 to-primary-700 p-2 rounded-lg text-white shadow-lg shadow-primary-500/30">
            <ClipboardList size={24} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            SyncClip 云剪贴板
          </h1>
        </div>
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
    </header>
  );
};