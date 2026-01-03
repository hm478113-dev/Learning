
import React, { useState } from 'react';
import { SongSegment } from '../types';
import { AdvancedPromptEditor } from './AdvancedPromptEditor';
import { MusicNote, ImageIcon, ChevronDown } from './Icons';

interface SongSegmentCardProps {
  segment: SongSegment;
  index: number;
  onUpdate?: (updatedSegment: SongSegment) => void;
}

export const SongSegmentCard: React.FC<SongSegmentCardProps> = ({ segment, index, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleFieldSave = (field: string, newValue: string) => {
    if (!onUpdate) return;
    const updated = { ...segment, [field]: newValue };
    onUpdate(updated);
  };

  return (
    <div 
      className="border border-pink-500/30 bg-slate-800/40 rounded-3xl overflow-hidden mb-6 transition-all hover:border-pink-500/50 animate-slide-up relative z-10"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-pink-900/10 border-b border-slate-700/50 hover:bg-slate-800/60 transition-all focus:outline-none relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl bg-slate-900 border border-slate-700 text-pink-400 shadow-lg">
            {index + 1}
          </div>
          <div className="text-right">
             <h3 className="font-black text-lg text-white group-hover:text-pink-400 transition-colors">
               {segment.section_type}
             </h3>
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Lyric Segment</span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
           <MusicNote className="w-5 h-5 text-pink-500/50" />
           <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronDown className="w-5 h-5 text-slate-400" />
           </div>
        </div>
      </button>

      <div className={`grid-rows-transition ${isOpen ? 'grid-rows-1' : 'grid-rows-0'}`}>
        <div className="overflow-hidden">
          <div className="p-8 space-y-10">
            
            <div className="bg-slate-950/50 p-8 rounded-2xl border-2 border-pink-900/20 relative">
                <div className="absolute -top-3 right-6 bg-pink-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">LYRICS // كلمات الأغنية</div>
                <textarea 
                  value={segment.lyrics_ar}
                  onChange={(e) => handleFieldSave('lyrics_ar', e.target.value)}
                  className="w-full bg-transparent text-2xl text-slate-100 font-bold leading-relaxed mb-6 whitespace-pre-line text-right outline-none focus:ring-1 focus:ring-pink-500/30 rounded"
                  rows={Math.max(2, segment.lyrics_ar.split('\n').length)}
                />
                <div className="pt-6 border-t border-slate-800" dir="ltr">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Transliteration / Guide</span>
                  <textarea 
                    value={segment.lyrics_en_transliteration}
                    onChange={(e) => handleFieldSave('lyrics_en_transliteration', e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-400 font-mono leading-relaxed italic outline-none focus:ring-1 focus:ring-pink-500/30 rounded"
                    rows={2}
                  />
                </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
                <MusicNote className="w-5 h-5 text-pink-400 mt-1" />
                <div className="flex-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Musical Cues & Vibe</span>
                    <input 
                      type="text"
                      value={segment.musical_cues}
                      onChange={(e) => handleFieldSave('musical_cues', e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-300 font-medium leading-relaxed italic outline-none focus:ring-1 focus:ring-pink-500/30 rounded"
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 text-pink-400 mb-2">
                    <ImageIcon className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Video Production Visuals</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AdvancedPromptEditor 
                      label="وصف المشهد المرئي (عربي)" 
                      initialValue={segment.visual_description_ar} 
                      isRtl={true} 
                      type="descriptive"
                      onSave={(val) => handleFieldSave('visual_description_ar', val)}
                    />
                    <AdvancedPromptEditor 
                      label="VISUAL DESCRIPTION (EN)" 
                      initialValue={segment.visual_description_en} 
                      type="descriptive"
                      onSave={(val) => handleFieldSave('visual_description_en', val)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
                    <div className="space-y-4">
                        <AdvancedPromptEditor 
                          label="IMAGE PROMPT (AR)" 
                          initialValue={segment.visual_prompt_ar} 
                          isRtl={true} 
                          onSave={(val) => handleFieldSave('visual_prompt_ar', val)}
                        />
                        <AdvancedPromptEditor 
                          label="IMAGE PROMPT (EN)" 
                          initialValue={segment.visual_prompt_en} 
                          onSave={(val) => handleFieldSave('visual_prompt_en', val)}
                        />
                    </div>
                    <div className="space-y-4">
                        <AdvancedPromptEditor 
                          label="ANIMATION PROMPT (AR)" 
                          initialValue={segment.animation_prompt_ar} 
                          isRtl={true} 
                          onSave={(val) => handleFieldSave('animation_prompt_ar', val)}
                        />
                        <AdvancedPromptEditor 
                          label="ANIMATION PROMPT (EN)" 
                          initialValue={segment.animation_prompt_en} 
                          onSave={(val) => handleFieldSave('animation_prompt_en', val)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase text-slate-500" dir="ltr">
                  <span className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 tracking-tighter">TRANSITION: {segment.transition_en}</span>
                  <span className="bg-slate-900 px-4 py-2 rounded-xl border border-pink-500/20 text-pink-400 tracking-tighter">ASPECT: {segment.technical_specs.aspect_ratio}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
