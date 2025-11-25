import React from 'react';
import { CharacterBible } from '../types';
import { User, Copy } from './Icons';
import { PromptDisplay } from './PromptDisplay';
import { EditableField } from './EditableField';

interface CharacterCardProps {
  bible: CharacterBible;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ bible }) => {
  // Safeguard: Check if characters array exists, otherwise wrap single character logic if needed
  // However, based on schema update, it should be an array.
  const characters = bible.characters || [];

  return (
    <div className="space-y-8">
      {characters.map((char, idx) => (
        <div key={idx} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 overflow-hidden relative group text-right shadow-lg">
          <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <User className="w-32 h-32 text-blue-400" />
          </div>
          
          <h3 className="text-xl font-bold text-blue-400 mb-8 flex items-center gap-2">
            <User className="w-6 h-6" /> 
            {characters.length > 1 ? `ملف الشخصية ${idx + 1}: ${char.name}` : 'ملف الشخصية // CHARACTER BIBLE'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
            <div className="space-y-6">
              <div>
                <EditableField 
                  label="الاسم / Name"
                  initialValue={char.name}
                  className="text-2xl font-black text-white font-mono"
                />
                <EditableField 
                  label="الدور / Role"
                  initialValue={char.role}
                  className="text-sm text-blue-300 font-bold mt-1"
                />
              </div>
              <div>
                <EditableField
                  label="التفاصيل (عربي)"
                  initialValue={char.details_ar}
                  multiline={true}
                  className="text-base text-slate-300 font-medium leading-relaxed"
                />
              </div>
              <div>
                <div dir="ltr">
                  <EditableField
                    label="DETAILS (English)"
                    initialValue={char.details_en}
                    multiline={true}
                    className="text-base text-slate-300 font-medium leading-relaxed text-left"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1 font-bold">الهوية البصرية</span>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                   <div dir="ltr">
                    <EditableField
                      initialValue={char.visual_identity}
                      multiline={true}
                      className="text-sm text-emerald-400 font-mono text-left font-medium"
                    />
                   </div>
                </div>
              </div>
              <div>
                 <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1 font-bold">لوحة الألوان</span>
                 <div className="flex gap-2 flex-wrap">
                    {char.color_palette.split(',').map((color, i) => (
                        <span key={i} className="px-3 py-1.5 text-xs font-bold bg-slate-700 rounded-md text-slate-200 border border-slate-600 shadow-sm">
                            {color.trim()}
                        </span>
                    ))}
                 </div>
              </div>
               <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1 font-bold">قواعد الملابس</span>
                <EditableField
                   initialValue={char.clothing_rules}
                   multiline={true}
                   className="text-sm text-slate-400 font-mono border-r-4 border-blue-500 pr-4"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8">
             <PromptDisplay 
                label={`MASTER CHARACTER PROMPT - ${char.name.toUpperCase()}`} 
                content={char.character_prompt}
             />
          </div>
        </div>
      ))}
    </div>
  );
};
