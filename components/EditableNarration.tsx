import React, { useState } from 'react';
import { Mic, Edit2, Save, X } from './Icons';

interface EditableNarrationProps {
  initialAr: string;
  initialEn: string;
}

export const EditableNarration: React.FC<EditableNarrationProps> = ({ initialAr, initialEn }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textAr, setTextAr] = useState(initialAr);
  const [textEn, setTextEn] = useState(initialEn);

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would propagate up
  };

  const handleCancel = () => {
    setTextAr(initialAr);
    setTextEn(initialEn);
    setIsEditing(false);
  };

  return (
    <div className="bg-amber-900/10 border border-amber-900/30 rounded-2xl p-6 relative transition-colors hover:bg-amber-900/15 group">
        <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2 text-amber-500 font-bold text-sm uppercase tracking-wider">
                <Mic className="w-4 h-4" /> النص السردي (Voiceover)
             </div>
             {!isEditing && (
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="opacity-40 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-amber-400"
                    title="تعديل السرد"
                 >
                    <Edit2 className="w-4 h-4" />
                 </button>
             )}
        </div>

        {!isEditing ? (
            <div className="animate-fade-in">
                <p className="text-lg text-slate-200 font-medium leading-relaxed pl-4 border-r-4 border-amber-600">
                "{textAr}"
                </p>
                <p className="text-sm text-slate-500 italic mt-3 text-left" dir="ltr">"{textEn}"</p>
            </div>
        ) : (
            <div className="space-y-4 animate-fade-in">
                <div>
                    <label className="text-xs text-slate-500 mb-1 block">النص العربي</label>
                    <textarea 
                        value={textAr}
                        onChange={(e) => setTextAr(e.target.value)}
                        className="w-full bg-slate-900/80 border border-amber-900/50 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none text-lg min-h-[80px]"
                        dir="rtl"
                    />
                </div>
                <div dir="ltr">
                    <label className="text-xs text-slate-500 mb-1 block">English Text</label>
                    <textarea 
                        value={textEn}
                        onChange={(e) => setTextEn(e.target.value)}
                        className="w-full bg-slate-900/80 border border-amber-900/50 rounded-lg p-3 text-slate-300 focus:ring-1 focus:ring-amber-500 outline-none text-sm min-h-[60px]"
                    />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={handleCancel} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded">
                        <X className="w-3 h-3" /> إلغاء
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded shadow-lg shadow-amber-900/20">
                        <Save className="w-3 h-3" /> حفظ التعديلات
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};