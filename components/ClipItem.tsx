import React, { useState } from 'react';
import { Clip } from '../types';
import { Copy, Trash2, Edit2, Check, X, Save, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/Button';
import { cn, formatDate } from '../utils';

interface ClipItemProps {
  clip: Clip;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string, note?: string) => Promise<void>;
  onCopy: (content: string) => void;
}

export const ClipItem: React.FC<ClipItemProps> = ({ clip, onDelete, onUpdate, onCopy }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(clip.content);
  const [editNote, setEditNote] = useState(clip.note || '');
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(clip.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await onUpdate(clip.id, editContent, editNote);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这条记录吗？')) {
      onDelete(clip.id);
    }
  };

  const isLongContent = clip.content.length > 300 || clip.content.split('\n').length > 5;

  return (
    <div className="group bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700/50 transition-all duration-300 animate-fade-in relative overflow-hidden">
      
      {/* Action Bar (Top Right) */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {!isEditing ? (
          <>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => setIsEditing(true)} title="编辑">
              <Edit2 size={16} />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleDelete} title="删除">
              <Trash2 size={16} />
            </Button>
          </>
        ) : (
          <>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={handleSave} title="保存">
              <Save size={16} />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500" onClick={() => setIsEditing(false)} title="取消">
              <X size={16} />
            </Button>
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="mb-3">
        {isEditing ? (
          <div className="space-y-3 mt-6 sm:mt-0">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              rows={5}
            />
            <input
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="备注..."
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        ) : (
          <>
            {(clip.note || editNote) && (
              <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-md">
                  {clip.note}
                </span>
              </div>
            )}
            <div className={cn("relative font-mono text-sm sm:text-base text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap", !expanded && isLongContent && "max-h-32 overflow-hidden mask-bottom")}>
               {clip.content}
               {!expanded && isLongContent && (
                 <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-dark-800 to-transparent" />
               )}
            </div>
            
            {isLongContent && (
              <button 
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-xs font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                {expanded ? <><Minimize2 size={12}/> 收起</> : <><Maximize2 size={12}/> 展开</>}
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer Info & Copy Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-2">
        <span className="text-xs text-gray-400 font-medium">
          {formatDate(clip.created_at)}
        </span>
        
        {!isEditing && (
          <Button
            onClick={handleCopy}
            variant={copied ? 'secondary' : 'primary'}
            size="sm"
            className={cn("transition-all duration-300", copied && "bg-green-500 border-green-500 text-white hover:bg-green-600")}
          >
            {copied ? (
              <>
                <Check size={16} className="mr-1.5" /> 已复制
              </>
            ) : (
              <>
                <Copy size={16} className="mr-1.5" /> 复制
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};