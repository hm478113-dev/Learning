
import React, { useState } from 'react';
import { Scene, VideoScene } from '../types';
import { AdvancedPromptEditor } from './AdvancedPromptEditor';
import { EditableNarration } from './EditableNarration';
import { ArrowLeft, ChevronDown } from './Icons';

interface SceneCardProps {
  scene: Scene | VideoScene;
  type: 'storybook' | 'video';
  index: number;
  onUpdate?: (updatedScene: Scene | VideoScene) => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, type, index, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(true);

  const themeColor = type === 'storybook' ? 'emerald' : 'purple';
  const borderColor = type === 'storybook' ? 'border-emerald-500/30' : 'border-purple-500/30';
  const bgColor = type === 'storybook' ? 'bg-emerald-900/10' : 'bg-purple-900/10';
  const textColor = type === 'storybook' ? 'text-emerald-400' : 'text-purple-400';

  const toggleOpen = () => setIsOpen(!isOpen);

  const actionDescriptionAr = (scene as VideoScene).action_description_ar || (scene as Scene).description_ar;
  const actionDescriptionEn = (scene as VideoScene).action_description_en || (scene as Scene).description_en;
  
  const motionType = (scene as VideoScene).tracks?.motion_type;
  const soundStyle = (scene as VideoScene).sound_style;

  const handleFieldSave = (field: string, newValue: string) => {
    if (!onUpdate) return;
    const updated = { ...scene, [field]: newValue };
    onUpdate(updated);
  };

  return (
    <div 
      className={`border ${borderColor} bg-slate-800/40 rounded-3xl overflow-hidden mb-6 transition-all hover:border-opacity-60 animate-slide-up relative z-10`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <button 
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between p-5 ${bgColor} border-b border-slate-700/50 hover:bg-slate-800/60 transition-all duration-300 focus:outline-none relative overflow-hidden group`}
        aria-expanded={isOpen}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-${themeColor}-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl bg-slate-900 border border-slate-700 ${textColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {scene.scene_number}
          </div>
          <div className="text-right">
             <h3 className={`font-bold text-lg text-white group-hover:${textColor} transition-colors`}>
               المشهد {scene.scene_number}
             </h3>
             {type === 'video' && (
               <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Video Asset Ready</span>
             )}
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
           {motionType && (
              <div className="hidden md:block bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-[10px] font-black text-slate-300 shadow-sm uppercase tracking-tighter">
                 {motionType}
              </div>
           )}
           <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronDown className="w-5 h-5 text-slate-400" />
           </div>
        </div>
      </button>

      <div className={`grid-rows-transition ${isOpen ? 'grid-rows-1' : 'grid-rows-0'}`}>
        <div className="overflow-hidden">
          <div className="p-8 space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <AdvancedPromptEditor 
                  label="وصف المشهد (عربي)" 
                  initialValue={actionDescriptionAr} 
                  isRtl={true} 
                  type="descriptive"
                  onSave={(val) => handleFieldSave(type === 'video' ? 'action_description_ar' : 'description_ar', val)}
               />
               <AdvancedPromptEditor 
                  label="SCENE DESCRIPTION (EN)" 
                  initialValue={actionDescriptionEn} 
                  isRtl={false} 
                  type="descriptive"
                  onSave={(val) => handleFieldSave(type === 'video' ? 'action_description_en' : 'description_en', val)}
               />
            </div>

            {type === 'video' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/30 p-6 rounded-2xl border border-slate-800/50">
                    <AdvancedPromptEditor 
                      label="Sound Direction & Audio Style" 
                      initialValue={soundStyle || "Cinematic Orchestra"} 
                      type="technical"
                      showAi={false}
                      onSave={(val) => handleFieldSave('sound_style', val)}
                    />
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Technical Vibe</span>
                        <div className="flex flex-wrap gap-2" dir="ltr">
                           <span className="px-3 py-1 bg-purple-900/20 text-purple-400 rounded-lg border border-purple-500/20 text-[10px] font-bold">4K RESOLUTION</span>
                           <span className="px-3 py-1 bg-blue-900/20 text-blue-400 rounded-lg border border-blue-500/20 text-[10px] font-bold">STABLE SHOT</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-2">
                <EditableNarration 
                  initialAr={scene.narration_ar} 
                  initialEn={scene.narration_en} 
                  onSave={(ar, en) => {
                    if (onUpdate) onUpdate({ ...scene, narration_ar: ar, narration_en: en });
                  }}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700/30">
                <div className="space-y-4">
                  <AdvancedPromptEditor 
                    label="VISUAL PROMPT (AR)" 
                    initialValue={scene.visual_prompt_ar} 
                    isRtl={true} 
                    onSave={(val) => handleFieldSave('visual_prompt_ar', val)}
                  />
                  <AdvancedPromptEditor 
                    label="VISUAL PROMPT (EN)" 
                    initialValue={scene.visual_prompt_en} 
                    onSave={(val) => handleFieldSave('visual_prompt_en', val)}
                  />
                </div>
                <div className="space-y-4">
                  <AdvancedPromptEditor 
                    label="ANIMATION PROMPT (AR)" 
                    initialValue={scene.animation_prompt_ar} 
                    isRtl={true} 
                    onSave={(val) => handleFieldSave('animation_prompt_ar', val)}
                  />
                  <AdvancedPromptEditor 
                    label="ANIMATION PROMPT (EN)" 
                    initialValue={scene.animation_prompt_en} 
                    onSave={(val) => handleFieldSave('animation_prompt_en', val)}
                  />
                </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase text-slate-500" dir="ltr">
                  <span className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 tracking-tighter">CAMERA: {scene.technical_specs.camera}</span>
                  <span className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 tracking-tighter">LENS: {scene.technical_specs.lens}</span>
                  <span className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 tracking-tighter">LIGHT: {scene.technical_specs.lighting}</span>
                  <span className={`bg-slate-900 px-4 py-2 rounded-xl border border-${themeColor}-500/20 text-${textColor} tracking-tighter`}>ASPECT: {scene.technical_specs.aspect_ratio}</span>
            </div>

            <div className="pt-6 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-slate-400">
                    <div className={`p-2 rounded-xl ${type === 'storybook' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-purple-900/20 text-purple-400'}`}>
                       <ArrowLeft className="w-4 h-4" />
                    </div>
                    <div>
                       <span className={`font-black ${textColor} block text-[10px] uppercase tracking-widest`}>الانتقال للمشهد التالي</span>
                       <span className="font-bold text-slate-200">{scene.transition_ar}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
