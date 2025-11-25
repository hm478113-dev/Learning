import React, { useState, useEffect } from 'react';
import { Edit2, Save, X } from './Icons';

interface EditableFieldProps {
  initialValue: string;
  label?: string;
  className?: string;
  multiline?: boolean;
  onSave?: (newValue: string) => void;
}

export const EditableField: React.FC<EditableFieldProps> = ({ 
  initialValue, 
  label, 
  className = "", 
  multiline = false,
  onSave 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) onSave(value);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  return (
    <div className={`group relative ${className}`}>
      {label && <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1 font-bold">{label}</span>}
      
      {!isEditing ? (
        <div className="relative">
          <div className={`${multiline ? "whitespace-pre-wrap" : ""} pr-6`}>
            {value}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-0 -left-6 opacity-40 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-blue-400"
            title="تعديل"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
              dir="auto"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              dir="auto"
            />
          )}
          <div className="flex gap-2 justify-end">
            <button onClick={handleCancel} className="p-1 hover:bg-slate-700 rounded text-slate-400">
              <X className="w-4 h-4" />
            </button>
            <button onClick={handleSave} className="p-1 hover:bg-blue-900 rounded text-blue-400">
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};