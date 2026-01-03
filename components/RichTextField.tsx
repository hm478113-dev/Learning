
import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Save, X } from './Icons';

interface RichTextFieldProps {
  initialValue: string;
  label?: string;
  className?: string;
  onSave?: (newValue: string) => void;
}

export const RichTextField: React.FC<RichTextFieldProps> = ({ 
  initialValue, 
  label, 
  className = "", 
  onSave 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    const newValue = editorRef.current?.innerHTML || value;
    setValue(newValue);
    setIsEditing(false);
    if (onSave) onSave(newValue);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
  };

  return (
    <div className={`group relative ${className}`}>
      {label && <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1 font-bold">{label}</span>}
      
      {!isEditing ? (
        <div className="relative">
          <div 
            className="rich-text-content pr-6 text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: value || '<i>لا يوجد تفاصيل...</i>' }}
          />
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-0 -left-6 opacity-40 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-blue-400"
            title="تعديل"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-0 border border-slate-700 rounded-xl overflow-hidden bg-slate-900 shadow-2xl animate-fade-in">
          <div className="flex gap-1 p-1.5 border-b border-slate-800 bg-slate-800/50">
            <button 
              onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} 
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700 font-bold text-sm text-slate-200"
              title="Bold"
            >
              B
            </button>
            <button 
              onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} 
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700 italic text-sm text-slate-200"
              title="Italic"
            >
              I
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1 self-center"></div>
            <button 
              onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} 
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700 text-sm text-slate-200"
              title="Unordered List"
            >
              •
            </button>
            <button 
              onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }} 
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700 text-sm text-slate-200"
              title="Ordered List"
            >
              1.
            </button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: value }}
            className="w-full bg-slate-950 text-slate-200 p-4 min-h-[160px] outline-none text-sm font-sans rich-text-editor"
            dir="auto"
          />
          <div className="flex gap-2 justify-end p-2 border-t border-slate-800 bg-slate-800/30">
            <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-lg border border-slate-700">
              <X className="w-3 h-3" /> إلغاء
            </button>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-900/20 transition-colors">
              <Save className="w-3 h-3" /> حفظ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
