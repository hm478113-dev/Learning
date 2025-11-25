import React, { useState } from 'react';
import { Copy, Check, Wand, X, Save } from './Icons';
import { rewriteSinglePrompt } from '../services/geminiService';

interface PromptDisplayProps {
  label: string;
  content: string;
  isRtl?: boolean;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ label, content, isRtl = false }) => {
  const [copied, setCopied] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentContent, setCurrentContent] = useState(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiRewrite = async () => {
    if (!aiInstruction.trim()) return;
    setIsLoading(true);
    try {
        const newText = await rewriteSinglePrompt(currentContent, aiInstruction);
        setCurrentContent(newText);
        setShowAiInput(false);
        setAiInstruction("");
    } catch (error) {
        console.error("Rewrite failed", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="mb-4 group text-right">
      <div className="flex justify-between items-center mb-2 px-1 flex-row-reverse">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        
        <div className="flex flex-row-reverse gap-2">
          {!showAiInput && (
              <button
                onClick={() => setShowAiInput(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-white transition-colors flex-row-reverse bg-purple-900/20 hover:bg-purple-600 px-2 py-1 rounded border border-purple-500/30 hover:border-purple-500"
              >
                 <Wand className="w-3 h-3" />
                 تعديل بالذكاء الاصطناعي
              </button>
          )}

          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors flex-row-reverse bg-slate-800 hover:bg-blue-600 px-2 py-1 rounded border border-slate-700 hover:border-blue-500"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'تم النسخ' : 'نسخ'}
          </button>
        </div>
      </div>

      {showAiInput && (
          <div className="mb-3 bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 animate-fade-in">
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    placeholder="اكتب تعليمات التعديل (مثال: اجعل الجو ممطراً، أضف تفاصيل أكثر...)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAiRewrite()}
                  />
                  <button 
                    onClick={handleAiRewrite}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold disabled:opacity-50"
                  >
                      {isLoading ? 'جاري التعديل...' : 'نفذ'}
                  </button>
                  <button 
                    onClick={() => setShowAiInput(false)}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                      <X className="w-4 h-4" />
                  </button>
              </div>
          </div>
      )}

      <div className="relative shadow-lg rounded-xl overflow-hidden ring-1 ring-slate-700 transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <pre 
          className={`bg-slate-950 border-x border-b border-slate-900 rounded-b-xl p-5 text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono leading-7 ${isRtl ? 'text-right' : 'text-left'}`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {currentContent}
        </pre>
      </div>
    </div>
  );
};