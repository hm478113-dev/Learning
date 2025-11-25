import React, { useState } from 'react';
import { Scene, VideoScene } from '../types';
import { EditableField } from './EditableField';
import { EditableNarration } from './EditableNarration';
import { PromptDisplay } from './PromptDisplay';
import { ArrowLeft, ChevronDown, ChevronUp } from './Icons';

interface SceneCardProps {
  scene: Scene | VideoScene;
  type: 'storybook' | 'video';
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, type }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Helper to determine theme colors based on type
  const themeColor = type === 'storybook' ? 'emerald' : 'purple';
  const borderColor = type === 'storybook' ? 'border-emerald-500/30' : 'border-purple-500/30';
  const bgColor = type === 'storybook' ? 'bg-emerald-900/10' : 'bg-purple-900/10';
  const textColor = type === 'storybook' ? 'text-emerald-400' : 'text-purple-400';

  const toggleOpen = () => setIsOpen(!isOpen);

  // Type Guards or safe access
  const actionDescriptionAr = (scene as VideoScene).action_description_ar || (scene as Scene).description_ar;
  const actionDescriptionEn = (scene as VideoScene).action_description_en || (scene as Scene).description_en;
  
  const motionType = (scene as VideoScene).tracks?.motion_type;
  const soundDirection = (scene as VideoScene).tracks?.sound_direction_en;

  return (
    <div className={`border ${borderColor} bg-slate-800/40 rounded-2xl overflow-hidden mb-6 transition-all hover:border-opacity-50`}>
      {/* Header - Always Visible */}
      <button 
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between p-5 ${bgColor} border-b border-slate-700/50 hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-${themeColor}-500`}
        aria-expanded={isOpen}
        aria-controls={`scene-content-${scene.scene_number}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl bg-slate-900 border border-slate-700 ${textColor}`}>
            {scene.scene_number}
          </div>
          <div className="text-right">
             <h3 className={`font-bold text-lg text-white`}>
               المشهد {scene.scene_number}
             </h3>
             {type === 'video' && (
               <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Duration: Max 5s</span>
             )}
          </div>
        </div>

        <div className="flex items-center gap-4">
           {motionType && (
              <div className="hidden md:block bg-slate-900 px-3 py-1 rounded border border-slate-700 text-xs font-mono text-slate-300">
                 {motionType}
              </div>
           )}
           {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div id={`scene-content-${scene.scene_number}`} className="p-6 animate-fade-in space-y-8">
          
          {/* Visual Description Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Arabic Column */}
             <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                   <span className={`w-2 h-2 rounded-full bg-${themeColor}-500`}></span>
                   <span className="text-xs font-bold text-slate-500 uppercase">الوصف (عربي)</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border-r-2 border-slate-700">
                    <EditableField 
                        initialValue={actionDescriptionAr} 
                        multiline={true}
                        className="text-lg text-slate-200 font-medium leading-relaxed" 
                    />
                </div>
             </div>

             {/* English Column */}
             <div className="space-y-2" dir="ltr">
                <div className="flex items-center gap-2 mb-2">
                   <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                   <span className="text-xs font-bold text-slate-500 uppercase">Description (English)</span>
                </div>
                <div className="bg-slate-900/30 p-4 rounded-xl border-l-2 border-slate-700 text-left">
                    <EditableField 
                        initialValue={actionDescriptionEn} 
                        multiline={true}
                        className="text-sm text-slate-400 font-mono leading-relaxed" 
                    />
                </div>
             </div>
          </div>

          {/* Sound Direction (Video Only) */}
          {type === 'video' && soundDirection && (
              <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800 flex items-start gap-4">
                  <div className="bg-slate-800 p-2 rounded text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  </div>
                  <div>
                      <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Sound Direction</span>
                      <p className="text-sm text-slate-300 font-mono" dir="ltr">{soundDirection}</p>
                  </div>
              </div>
          )}

          {/* Voiceover Script */}
          <div className="pt-2">
              <EditableNarration 
                initialAr={scene.narration_ar} 
                initialEn={scene.narration_en} 
              />
          </div>

          {/* Prompts Section */}
          <div className="space-y-4 pt-4 border-t border-slate-700/50">
                <PromptDisplay label="VISUAL PROMPT (AR)" content={scene.visual_prompt_ar} isRtl={true} />
                <PromptDisplay label="VISUAL PROMPT (EN)" content={scene.visual_prompt_en} />
                <PromptDisplay label="ANIMATION PROMPT (Runway/Kling)" content={scene.animation_prompt_en} />
          </div>

          {/* Technical Specs Tags */}
          <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-500" dir="ltr">
                <span className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800">Cam: {scene.technical_specs.camera}</span>
                <span className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800">Lens: {scene.technical_specs.lens}</span>
                <span className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800">Light: {scene.technical_specs.lighting}</span>
                <span className={`bg-slate-900 px-3 py-1.5 rounded border border-${themeColor}-900/50 text-${textColor}`}>AR: {scene.technical_specs.aspect_ratio}</span>
          </div>

          {/* Footer: Transitions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-400">
                <ArrowLeft className={`w-4 h-4 ${textColor}`} />
                <span className={`font-bold ${textColor}`}>الانتقال التالي:</span>
                <span className="font-medium text-white">{scene.transition_ar}</span>
            </div>
            <span className="font-mono text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded">{scene.transition_en}</span>
          </div>

        </div>
      )}
    </div>
  );
};
