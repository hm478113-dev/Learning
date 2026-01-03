import React, { useState } from 'react';
import { Sliders, Sun, CircleHalf, Thermometer, Droplet } from './Icons';

interface VisualTweakPanelProps {
  onApply: (instruction: string) => void;
  isProcessing: boolean;
}

export const VisualTweakPanel: React.FC<VisualTweakPanelProps> = ({ onApply, isProcessing }) => {
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [warmth, setWarmth] = useState(50);
  const [saturation, setSaturation] = useState(50);

  const getTerm = (value: number, low: string, mid: string, high: string) => {
    if (value < 35) return low;
    if (value > 65) return high;
    return null;
  };

  const handleApply = () => {
    const terms: string[] = [];
    
    // Exposure
    const b = getTerm(brightness, "Low Key / Dim Lighting", "", "High Key / Bright Exposure");
    if (b) terms.push(b);
    
    // Contrast
    const c = getTerm(contrast, "Soft / Low Contrast / Hazy", "", "High Contrast / Dramatic Shadows");
    if (c) terms.push(c);

    // Temperature
    const w = getTerm(warmth, "Cool / Blue Tones / Cold Atmosphere", "", "Warm / Golden Tones / Cozy Atmosphere");
    if (w) terms.push(w);

    // Saturation
    const s = getTerm(saturation, "Desaturated / Muted Colors / Bleach Bypass", "", "Vivid / Saturated Colors / Vibrant");
    if (s) terms.push(s);

    if (terms.length === 0) {
        // If everything is middle, maybe reset
        onApply("Reset visual adjustments to balanced/neutral style.");
        return;
    }

    const instruction = `Apply these visual adjustments to all generated prompts: ${terms.join(", ")}.`;
    onApply(instruction);
  };

  const SliderControl = ({ 
    label, 
    icon: Icon, 
    value, 
    onChange, 
    lowLabel, 
    highLabel,
    colorClass
  }: { 
    label: string, 
    icon: any, 
    value: number, 
    onChange: (val: number) => void,
    lowLabel: string,
    highLabel: string,
    colorClass: string
  }) => (
    <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
       <div className="flex items-center justify-between text-slate-300 text-sm font-bold">
           <div className="flex items-center gap-2">
               <Icon className={`w-4 h-4 ${colorClass}`} />
               {label}
           </div>
           <span className="font-mono text-slate-500 text-xs">{value}%</span>
       </div>
       <input 
          type="range" 
          min="0" 
          max="100" 
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-${colorClass.split('-')[1]}-500`}
       />
       <div className="flex justify-between text-[10px] uppercase font-bold text-slate-600 tracking-wider">
           <span>{lowLabel}</span>
           <span>{highLabel}</span>
       </div>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-blue-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sliders className="w-24 h-24 text-blue-400" />
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                    <Sliders className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">تعديلات بصرية (Post-Generation Tweaks)</h3>
                    <p className="text-xs text-slate-400">تحسين الإضاءة والألوان في البرومبتات المولدة</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <SliderControl 
                    label="الإضاءة (Brightness)" 
                    icon={Sun} 
                    value={brightness} 
                    onChange={setBrightness}
                    lowLabel="Low Key"
                    highLabel="High Key"
                    colorClass="text-yellow-400"
                />
                <SliderControl 
                    label="التباين (Contrast)" 
                    icon={CircleHalf} 
                    value={contrast} 
                    onChange={setContrast}
                    lowLabel="Soft"
                    highLabel="Dramatic"
                    colorClass="text-slate-200"
                />
                <SliderControl 
                    label="الحرارة (Temperature)" 
                    icon={Thermometer} 
                    value={warmth} 
                    onChange={setWarmth}
                    lowLabel="Cool"
                    highLabel="Warm"
                    colorClass="text-orange-400"
                />
                <SliderControl 
                    label="التشبع (Saturation)" 
                    icon={Droplet} 
                    value={saturation} 
                    onChange={setSaturation}
                    lowLabel="Muted"
                    highLabel="Vibrant"
                    colorClass="text-pink-400"
                />
            </div>

            <button 
                onClick={handleApply}
                disabled={isProcessing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       جاري تطبيق التعديلات...
                    </>
                ) : (
                    <>
                       <Sliders className="w-4 h-4" />
                       تطبيق التعديلات على البرومبت
                    </>
                )}
            </button>
        </div>
    </div>
  );
};