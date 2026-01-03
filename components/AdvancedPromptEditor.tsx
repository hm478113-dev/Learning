
import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Wand, X, Save, Edit2 } from './Icons';
import { rewriteSinglePrompt } from '../services/geminiService';

interface AdvancedPromptEditorProps {
  label: string;
  initialValue: string;
  isRtl?: boolean;
  onSave?: (newValue: string) => void;
  showAi?: boolean;
  type?: 'technical' | 'descriptive';
}

export const AdvancedPromptEditor: React.FC<AdvancedPromptEditorProps> = ({ 
  label, 
  initialValue, 
  isRtl = false, 
  onSave,
  showAi = true,
  type = 'technical'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  const handleCopy = () => {
    // Strip HTML for clipboard
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = currentValue;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const newValue = editorRef.current?.innerHTML || currentValue;
    setCurrentValue(newValue);
    setIsEditing(false);
    if (onSave) onSave(newValue);
  };

  const handleAiRewrite = async () => {
    if (!aiInstruction.trim()) return;
    setIsLoading(true);
    try {
        // Strip HTML before sending to AI for best results
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = currentValue;
        const plainText = tempDiv.textContent || "";
        
        const newText = await rewriteSinglePrompt(plainText, aiInstruction);
        setCurrentValue(newText);
        setShowAiInput(false);
        setAiInstruction("");
        if (onSave) onSave(newText);
    } catch (error) {
        console.error("Rewrite failed", error);
    } finally {
        setIsLoading(false);
    }
  };

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
  };

  return (
    <div className="group/editor mb-4 text-right animate-fade-in">
      <div className="flex justify-between items-center mb-2 flex-row-reverse px-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        
        <div className="flex flex-row-reverse gap-1.5">
          {!isEditing && !showAiInput && (
            <>
              {showAi && (
                <button
                  onClick={() => setShowAiInput(true)}
                  className="flex items-center gap-1 p-1.5 rounded bg-purple-900/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all border border-purple-500/20"
                  title="AI Rewrite"
                >
                  <Wand className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 p-1.5 rounded bg-blue-900/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20"
                title="Manual Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 p-1.5 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </>
          )}

          {isEditing && (
            <>
              <button onClick={handleSave} className="bg-emerald-600 text-white p-1.5 rounded hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"><Save className="w-4 h-4" /></button>
              <button onClick={() => setIsEditing(false)} className="bg-slate-800 text-slate-400 p-1.5 rounded hover:bg-slate-700 transition-colors border border-slate-700"><X className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>

      {showAiInput && (
        <div className="mb-3 bg-purple-900/30 border border-purple-500/30 rounded-xl p-3 animate-slide-up flex gap-2">
            <input 
              type="text" 
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              placeholder="تعليمات الذكاء الاصطناعي..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-purple-500 outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAiRewrite()}
            />
            <button 
              onClick={handleAiRewrite}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
            >
              {isLoading ? '...' : 'تعديل'}
            </button>
            <button onClick={() => setShowAiInput(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className={`relative rounded-xl overflow-hidden border-2 transition-all ${isEditing ? 'border-blue-500 bg-slate-900' : 'border-slate-800 bg-slate-950/50'}`}>
        {isEditing && (
          <div className="flex gap-1 p-1 border-b border-slate-800 bg-slate-900">
            <button onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-xs text-slate-400 font-bold">B</button>
            <button onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-xs text-slate-400 italic">I</button>
            <div className="w-px h-3 bg-slate-700 self-center mx-1"></div>
            <button onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-xs text-slate-400">•</button>
          </div>
        )}
        
        <div 
          ref={editorRef}
          contentEditable={isEditing}
          dangerouslySetInnerHTML={{ __html: currentValue }}
          className={`p-4 outline-none leading-relaxed transition-all ${isEditing ? 'min-h-[120px]' : ''} ${isRtl ? 'text-right' : 'text-left'} ${type === 'technical' ? 'font-mono text-[13px] text-slate-400' : 'text-sm text-slate-200'} rich-text-content`}
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      </div>
    </div>
  );
};
