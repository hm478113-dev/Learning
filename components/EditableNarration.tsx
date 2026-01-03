
import React, { useState } from 'react';
import { Mic, Edit2, Save, X, Wand } from './Icons';
import { rewriteSinglePrompt } from '../services/geminiService';

interface EditableNarrationProps {
  initialAr: string;
  initialEn: string;
  onSave?: (ar: string, en: string) => void;
}

export const EditableNarration: React.FC<EditableNarrationProps> = ({ initialAr, initialEn, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textAr, setTextAr] = useState(initialAr);
  const [textEn, setTextEn] = useState(initialEn);
  const [isRegenerating, setIsRegenerating] = useState<'ar' | 'en' | null>(null);

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) {
        onSave(textAr, textEn);
    }
  };

  const handleCancel = () => {
    setTextAr(initialAr);
    setTextEn(initialEn);
    setIsEditing(false);
  };

  const handleRegenerate = async (lang: 'ar' | 'en') => {
      setIsRegenerating(lang);
      const currentText = lang === 'ar' ? textAr : textEn;
      const instruction = lang === 'ar' 
        ? "أعد صياغة هذا النص السردي ليكون أكثر احترافية، جاذبية، ومناسباً لقصة سينمائية. حافظ على المعنى الأساسي."
        : "Rewrite this narration script to be more engaging, professional, and cinematic. Keep the core meaning.";
      
      try {
          const newText = await rewriteSinglePrompt(currentText, instruction);
          if (lang === 'ar') setTextAr(newText);
          else setTextEn(newText);
      } catch (error) {
          console.error("Regeneration failed", error);
      } finally {
          setIsRegenerating(null);
      }
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
                    className="opacity-60 hover:opacity-100 transition-opacity text-slate-400 hover:text-amber-400 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border border-transparent hover:border-amber-500/30 hover:bg-amber-900/20"
                    title="تعديل السرد"
                 >
                    <Edit2 className="w-4 h-4" /> تعديل / إعادة توليد
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
            <div className="space-y-6 animate-fade-in">
                {/* Arabic Edit */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-500 block">النص العربي</label>
                        <button 
                            onClick={() => handleRegenerate('ar')}
                            disabled={!!isRegenerating}
                            className="text-[10px] flex items-center gap-1 text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors bg-purple-900/20 px-2 py-1 rounded border border-purple-500/20 hover:bg-purple-900/40"
                        >
                            <Wand className={`w-3 h-3 ${isRegenerating === 'ar' ? 'animate-spin' : ''}`} />
                            {isRegenerating === 'ar' ? 'جاري الصياغة...' : 'إعادة صياغة ذكية'}
                        </button>
                    </div>
                    <textarea 
                        value={textAr}
                        onChange={(e) => setTextAr(e.target.value)}
                        className="w-full bg-slate-900/80 border border-amber-900/50 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none text-lg min-h-[80px]"
                        dir="rtl"
                    />
                </div>

                {/* English Edit */}
                <div dir="ltr" className="space-y-2">
                     <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-500 block">English Text</label>
                        <button 
                            onClick={() => handleRegenerate('en')}
                            disabled={!!isRegenerating}
                            className="text-[10px] flex items-center gap-1 text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors bg-purple-900/20 px-2 py-1 rounded border border-purple-500/20 hover:bg-purple-900/40"
                        >
                            <Wand className={`w-3 h-3 ${isRegenerating === 'en' ? 'animate-spin' : ''}`} />
                            {isRegenerating === 'en' ? 'Smart Rewrite' : 'Smart Rewrite'}
                        </button>
                    </div>
                    <textarea 
                        value={textEn}
                        onChange={(e) => setTextEn(e.target.value)}
                        className="w-full bg-slate-900/80 border border-amber-900/50 rounded-lg p-3 text-slate-300 focus:ring-1 focus:ring-amber-500 outline-none text-sm min-h-[60px]"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button onClick={handleCancel} className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                        <X className="w-3 h-3" /> إلغاء
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg shadow-lg shadow-amber-900/20">
                        <Save className="w-3 h-3" /> حفظ التعديلات
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
