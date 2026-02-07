import React, { useState, useRef, useEffect } from 'react';
import { Send, StickyNote, X } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils';

interface InputAreaProps {
  onSubmit: (content: string, note?: string) => Promise<void>;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSubmit, disabled }) => {
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content, note);
      setContent('');
      setNote('');
      setShowNote(false);
      // Reset height
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] pb-safe transition-all">
      <div className="max-w-4xl mx-auto p-4">
        {showNote && (
          <div className="mb-2 animate-slide-up flex items-center gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注（可选）..."
              maxLength={200}
              className="flex-1 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <Button size="sm" variant="ghost" onClick={() => setShowNote(false)}>
              <X size={16} />
            </Button>
          </div>
        )}
        
        <div className="flex gap-3 items-end">
          <Button
            variant="secondary"
            size="icon"
            className={cn("mb-[2px] shrink-0", showNote && "bg-primary-50 text-primary-600 dark:bg-primary-900/30")}
            onClick={() => setShowNote(!showNote)}
            title="添加备注"
          >
            <StickyNote size={20} />
          </Button>

          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="在此输入或粘贴内容... (Ctrl+Enter 发送)"
              maxLength={5000}
              className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 outline-none resize-none min-h-[48px] max-h-[200px] transition-all"
              disabled={disabled || isSubmitting}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-400 pointer-events-none">
              {content.length}/5000
            </div>
          </div>

          <Button
            size="icon"
            className="mb-[2px] rounded-xl shrink-0"
            onClick={handleSubmit}
            disabled={!content.trim() || disabled}
            loading={isSubmitting}
            title="发送"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};