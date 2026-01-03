
import React from 'react';
import { CharacterBible } from '../types';
import { User, Mic, Copy } from './Icons';
import { PromptDisplay } from './PromptDisplay';
import { EditableField } from './EditableField';
import { RichTextField } from './RichTextField';

interface CharacterCardProps {
  bible: CharacterBible;
  onUpdate?: (index: number, updatedChar: any) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ bible, onUpdate }) => {
  const characters = bible?.characters || [];

  const handleUpdate = (idx: number, field: string, value: any) => {
    if (!onUpdate) return;
    const updated = { ...characters[idx], [field]: value };
    onUpdate(idx, updated);
  };

  const handleVoiceUpdate = (idx: number, voiceField: string, value: string) => {
    if (!onUpdate) return;
    const updatedVoice = { ...characters[idx].voice_profile, [voiceField]: value };
    handleUpdate(idx, 'voice_profile', updatedVoice);
  };

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
                  onSave={(val) => handleUpdate(idx, 'name', val)}
                />
                <EditableField 
                  label="الدور / Role"
                  initialValue={char.role}
                  className="text-sm text-blue-300 font-bold mt-1"
                  onSave={(val) => handleUpdate(idx, 'role', val)}
                />
              </div>
              
              {/* Voice Profile Section */}
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-blue-500/20 space-y-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Mic className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Audio DNA // الهوية الصوتية</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <EditableField 
                      label="الجنس / Gender"
                      initialValue={char.voice_profile?.gender || "Male"}
                      className="text-xs text-slate-300"
                      onSave={(val) => handleVoiceUpdate(idx, 'gender', val)}
                    />
                    <EditableField 
                      label="الفئة العمرية / Age"
                      initialValue={char.voice_profile?.age_group || "Adult"}
                      className="text-xs text-slate-300"
                      onSave={(val) => handleVoiceUpdate(idx, 'age_group', val)}
                    />
                </div>
                <EditableField 
                  label="وصف نبرة الصوت / Tone Description"
                  initialValue={char.voice_profile?.tone_description_ar || "صوت عميق ورزين"}
                  multiline={true}
                  className="text-sm text-blue-100 italic"
                  onSave={(val) => handleVoiceUpdate(idx, 'tone_description_ar', val)}
                />
                <div dir="ltr">
                  <EditableField 
                    initialValue={char.voice_profile?.tone_description_en || "Deep and calm voice"}
                    className="text-[10px] text-slate-500 font-mono text-left"
                    onSave={(val) => handleVoiceUpdate(idx, 'tone_description_en', val)}
                  />
                </div>
              </div>

              <div>
                <RichTextField
                  label="التفاصيل (عربي)"
                  initialValue={char.details_ar}
                  className="text-base text-slate-300 font-medium"
                  onSave={(val) => handleUpdate(idx, 'details_ar', val)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1 font-bold">الهوية البصرية (DNA)</span>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                   <div dir="ltr">
                    <EditableField
                      initialValue={char.visual_identity}
                      multiline={true}
                      className="text-sm text-emerald-400 font-mono text-left font-medium"
                      onSave={(val) => handleUpdate(idx, 'visual_identity', val)}
                    />
                   </div>
                </div>
              </div>
              <div>
                 <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1 font-bold">لوحة الألوان</span>
                 <div className="flex gap-2 flex-wrap">
                    {(char.color_palette || "").split(',').map((color, i) => (
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
                   onSave={(val) => handleUpdate(idx, 'clothing_rules', val)}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8">
             <PromptDisplay 
                label={`MASTER CHARACTER PROMPT - ${char.name.toUpperCase()}`} 
                content={char.character_prompt}
                onSave={(val) => handleUpdate(idx, 'character_prompt', val)}
             />
          </div>
        </div>
      ))}
    </div>
  );
};
