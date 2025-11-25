import React, { useState, useRef, useEffect } from 'react';
import { GenerationMode, CombinedResponse, AppStage, Question, ContentType } from './types';
import { APP_NAME, APP_VERSION, ASPECT_RATIOS, CONTENT_STYLES, LANGUAGES, DIALECTS, TRANSITION_STYLES, STORY_TYPES } from './constants';
import { generateUltraPrompt, generateAnalysisQuestions, refineUltraPrompt, ImageData } from './services/geminiService';
import { CharacterCard } from './components/CharacterCard';
import { PromptDisplay } from './components/PromptDisplay';
import { EditableNarration } from './components/EditableNarration';
import { EditableField } from './components/EditableField';
import { SceneCard } from './components/SceneCard';
import { RatingStars } from './components/RatingStars';
import { Sparkles, Zap, Clapperboard, BookOpen, Mic, ImageIcon, MapPin, UploadCloud, Trash2, Wand } from './components/Icons';

// Content specific guides
const CONTENT_GUIDES: Record<ContentType, { 
  title: string;
  placeholder: string; 
  requirements: string[];
  color: string;
  bgGradient: string;
  icon: React.ElementType;
}> = {
  image: {
    title: "توليد وصف الصور (Image Generation)",
    placeholder: "صف المشهد بدقة: ماذا ترى؟ ما هو جو الصورة؟ الإضاءة؟ الشخصية الرئيسية؟ (مثال: صورة بورتريه سينمائية لرجل عجوز في ورشة ساعات قديمة، إضاءة خافتة، تفاصيل دقيقة...)",
    requirements: [
      "تكوين الصورة (Composition)",
      "نوع العدسة وزاوية التصوير",
      "الإضاءة (Natural, Cinematic, Neon)",
      "المشاعر والجو العام (Mood)"
    ],
    color: "text-blue-400",
    bgGradient: "from-blue-900/50 to-blue-800/50",
    icon: ImageIcon
  },
  story: {
    title: "كتابة القصة المصورة (Storybook)",
    placeholder: "اكتب ملخص القصة: البداية، العقدة، والنهاية. من هم الأبطال؟ وأين تدور الأحداث؟ (مثال: قصة قصيرة عن طفل يجد مفتاحاً سحرياً في الغابة، وكيف يغير ذلك قريته...)",
    requirements: [
      "تسلسل الأحداث (Plot)",
      "تطور الشخصيات",
      "الرسالة الأخلاقية أو الفكرة",
      "البيئة وتغيراتها عبر المشاهد"
    ],
    color: "text-emerald-400",
    bgGradient: "from-emerald-900/50 to-emerald-800/50",
    icon: BookOpen
  },
  video: {
    title: "إنتاج الفيديو السينمائي (Video Prompts)",
    placeholder: "صف الفيديو: نوع الحركة، المؤثرات البصرية، تتابع اللقطات، والأسلوب السينمائي... (مثال: فيديو ترويجي لسيارة سباق في مدينة مستقبلية ليلاً، سرعة عالية، ومؤثرات ضوئية...)",
    requirements: [
      "حركة الكاميرا (Drone, Dolly, Handheld)",
      "نوع الحركة في المشهد (Motion)",
      "المؤثرات البصرية (VFX)",
      "تصميم الصوت (Sound Design)"
    ],
    color: "text-purple-400",
    bgGradient: "from-purple-900/50 to-purple-800/50",
    icon: Clapperboard
  }
};

function App() {
  const MAX_CHARS = 2000;
  const [stage, setStage] = useState<AppStage>('initial');
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.STANDARD);
  
  // Data State
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [concept, setConcept] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("ar");
  const [selectedDialect, setSelectedDialect] = useState("msa");
  const [selectedTransition, setSelectedTransition] = useState("Dynamic");
  const [storyType, setStoryType] = useState("narrative");
  
  // Images
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [response, setResponse] = useState<CombinedResponse | null>(null);
  
  // Refinement State
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState("");

  // UI State
  const [activeTab, setActiveTab] = useState<'storybook' | 'video'>('storybook');
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<string>("0.0");
  
  // Refs
  const formRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load average rating from local storage simulation
    const ratings = JSON.parse(localStorage.getItem('user_ratings') || '[]');
    if (ratings.length > 0) {
        const sum = ratings.reduce((a: number, b: number) => a + b, 0);
        setAverageRating((sum / ratings.length).toFixed(1));
    }
  }, []);

  const handleContentTypeSelect = (type: ContentType) => {
    setContentType(type);
    setConcept(""); // Clear previous concept if switching
    // Set default style
    if (CONTENT_STYLES[type] && CONTENT_STYLES[type].length > 0) {
        setSelectedStyle(CONTENT_STYLES[type][0].id);
    }
    // Smooth scroll to form after short delay
    setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // remove data url prefix
        if (base64String) {
             const base64Data = base64String.split(',')[1];
             setUploadedImages(prev => [...prev, { mimeType: file.type, data: base64Data }]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() && uploadedImages.length === 0) return;
    if (!contentType) return;

    setStage('analyzing');
    setError(null);

    try {
      const generatedQuestions = await generateAnalysisQuestions(concept, mode, contentType, selectedStyle, uploadedImages);
      setQuestions(generatedQuestions);
      setStage('questions');
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحليل المفهوم. يرجى المحاولة مرة أخرى.");
      setStage('initial');
    }
  };

  const handleAnswerChange = (id: number, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleFinalGeneration = async () => {
    if (!contentType) return;
    setStage('generating');
    setError(null);

    // Combine questions text with answers for the AI context
    const qaContext: Record<string, string> = {};
    questions.forEach(q => {
      qaContext[q.question_ar] = answers[q.id] || "ترك الخيار للنظام";
    });

    try {
      const result = await generateUltraPrompt(
        concept, 
        qaContext, 
        mode, 
        aspectRatio, 
        selectedStyle, 
        selectedLanguage, 
        selectedDialect, 
        selectedTransition, 
        storyType,
        uploadedImages
      );
      setResponse(result);
      setStage('results');
      // Set active tab based on content type for better UX
      if (contentType === 'video') setActiveTab('video');
      else setActiveTab('storybook');
    } catch (err) {
      console.error(err);
      setError("فشل في إنشاء الاستجابة النهائية. يرجى التحقق من المدخلات.");
      setStage('questions');
    }
  };

  const handleRefinement = async () => {
    if (!response || !refineInstruction.trim()) return;
    setIsRefining(true);
    try {
        const refinedResponse = await refineUltraPrompt(response, refineInstruction);
        setResponse(refinedResponse);
        setRefineInstruction("");
    } catch (err) {
        console.error(err);
        alert("فشل التعديل، حاول مرة أخرى.");
    } finally {
        setIsRefining(false);
    }
  };

  const handleRatingSubmit = (rating: number) => {
    const ratings = JSON.parse(localStorage.getItem('user_ratings') || '[]');
    ratings.push(rating);
    localStorage.setItem('user_ratings', JSON.stringify(ratings));
    // Update local average
    const sum = ratings.reduce((a: number, b: number) => a + b, 0);
    setAverageRating((sum / ratings.length).toFixed(1));
  };

  const resetApp = () => {
    setStage('initial');
    setConcept("");
    setQuestions([]);
    setAnswers({});
    setResponse(null);
    setError(null);
    setUploadedImages([]);
    setRefineInstruction("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fullReset = () => {
    resetApp();
    setContentType(null);
  };

  const goToQuestions = () => {
    setStage('questions');
    setResponse(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to bottom when stage changes
  useEffect(() => {
    if (stage !== 'initial') {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stage, questions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans" dir="rtl">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={fullReset}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">{APP_NAME}</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest text-left uppercase" dir="ltr">{APP_VERSION}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Rating Badge */}
             {Number(averageRating) > 0 && (
                <div className="hidden md:flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                    <span className="text-yellow-400 text-xs font-bold flex gap-1 items-center">
                        ★ {averageRating}
                    </span>
                    <span className="text-[10px] text-slate-500">تقييم المستخدمين</span>
                </div>
             )}

             {stage === 'initial' && (
               <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button
                    onClick={() => setMode(GenerationMode.STANDARD)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mode === GenerationMode.STANDARD ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    قياسي
                  </button>
                  <button
                     onClick={() => setMode(GenerationMode.ULTRA_EXPERT)}
                     className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${mode === GenerationMode.ULTRA_EXPERT ? 'bg-indigo-900/50 text-indigo-300 ring-1 ring-indigo-500/50' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Zap className="w-3 h-3" /> وضع الخبير
                  </button>
               </div>
             )}
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Stage 1: Landing & Selection */}
        {stage === 'initial' || stage === 'analyzing' ? (
           <div className="animate-fade-in-up">
              
              {/* Hero Section */}
              <div className="text-center mb-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-xs font-bold mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    نظام توليد الأوامر الذكي
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-normal text-blue-300 mb-6 leading-tight font-decorative">
                  معاً لكتابة برومبت احترافي يناسب احتياجاتك الإبداعية
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                  نحول أفكارك إلى أوامر تقنية دقيقة متوافقة مع أحدث أدوات الذكاء الاصطناعي بخطوات بسيطة.
                </p>
              </div>

              {/* Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  {/* Image Card */}
                  <button
                     onClick={() => handleContentTypeSelect('image')}
                     className={`group relative overflow-hidden rounded-2xl p-8 border text-right transition-all duration-300 hover:-translate-y-2 shadow-2xl ${
                        contentType === 'image' 
                        ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/50 shadow-blue-900/20' 
                        : 'bg-slate-800 border-slate-700 hover:border-blue-500/50 shadow-black/20'
                     }`}
                  >
                     <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 transform origin-left transition-transform duration-300 ${contentType === 'image' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                     <div className="relative z-10 flex flex-col items-start h-full">
                        <div className={`p-4 rounded-xl mb-6 transition-colors ${
                            contentType === 'image' ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-700/50 text-slate-400 group-hover:bg-blue-900/30 group-hover:text-blue-400'
                        }`}>
                           <ImageIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">صور احترافية</h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">توليد وصف دقيق للإضاءة، العدسات، والتكوين الفني لأدوات مثل Midjourney.</p>
                     </div>
                  </button>

                  {/* Story Card */}
                  <button
                     onClick={() => handleContentTypeSelect('story')}
                     className={`group relative overflow-hidden rounded-2xl p-8 border text-right transition-all duration-300 hover:-translate-y-2 shadow-2xl ${
                        contentType === 'story' 
                        ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/50 shadow-emerald-900/20' 
                        : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50 shadow-black/20'
                     }`}
                  >
                     <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400 transform origin-left transition-transform duration-300 ${contentType === 'story' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                     <div className="relative z-10 flex flex-col items-start h-full">
                        <div className={`p-4 rounded-xl mb-6 transition-colors ${
                            contentType === 'story' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-700/50 text-slate-400 group-hover:bg-emerald-900/30 group-hover:text-emerald-400'
                        }`}>
                           <BookOpen className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">قصص مصورة</h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">بناء شخصيات ثابتة، سرد قصصي متسلسل، ومشاهد مترابطة لعمل كتب الأطفال.</p>
                     </div>
                  </button>

                  {/* Video Card */}
                  <button
                     onClick={() => handleContentTypeSelect('video')}
                     className={`group relative overflow-hidden rounded-2xl p-8 border text-right transition-all duration-300 hover:-translate-y-2 shadow-2xl ${
                        contentType === 'video' 
                        ? 'bg-slate-800 border-purple-500 ring-2 ring-purple-500/50 shadow-purple-900/20' 
                        : 'bg-slate-800 border-slate-700 hover:border-purple-500/50 shadow-black/20'
                     }`}
                  >
                     <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-400 transform origin-left transition-transform duration-300 ${contentType === 'video' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                     <div className="relative z-10 flex flex-col items-start h-full">
                        <div className={`p-4 rounded-xl mb-6 transition-colors ${
                            contentType === 'video' ? 'bg-purple-900/30 text-purple-400' : 'bg-slate-700/50 text-slate-400 group-hover:bg-purple-900/30 group-hover:text-purple-400'
                        }`}>
                           <Clapperboard className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">إنتاج فيديو</h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">توجيه زوايا الكاميرا، الحركة، والمؤثرات لأدوات مثل Sora و Runway.</p>
                     </div>
                  </button>
              </div>

              {/* Form Section - Revealed on Selection */}
              {contentType && (
                  <div ref={formRef} className="animate-fade-in-up bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${CONTENT_GUIDES[contentType].bgGradient}`}></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                       <div className={`p-3 rounded-xl bg-slate-800 border border-slate-700 ${CONTENT_GUIDES[contentType].color}`}>
                          {React.createElement(CONTENT_GUIDES[contentType].icon, { className: "w-8 h-8" })}
                       </div>
                       <h2 className="text-3xl font-bold text-white">{CONTENT_GUIDES[contentType].title}</h2>
                    </div>

                    <form onSubmit={handleStartAnalysis} className="space-y-8">
                      {/* Concept Input & Image Upload Unified */}
                      <div className="relative group bg-slate-950/50 border-2 border-slate-800 rounded-2xl transition-all focus-within:border-slate-600 focus-within:shadow-lg overflow-hidden">
                        
                        {/* Gradient Glow */}
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${CONTENT_GUIDES[contentType].bgGradient} opacity-0 group-focus-within:opacity-20 transition-opacity blur-xl rounded-2xl pointer-events-none`}></div>

                        <textarea
                          value={concept}
                          onChange={(e) => setConcept(e.target.value)}
                          placeholder={CONTENT_GUIDES[contentType].placeholder}
                          maxLength={MAX_CHARS}
                          className="w-full bg-transparent text-slate-200 placeholder-slate-600 p-6 text-lg leading-relaxed focus:outline-none min-h-[160px] resize-y relative z-10"
                          dir="auto"
                          disabled={stage === 'analyzing'}
                        />

                        {/* Image Preview Area */}
                        {uploadedImages.length > 0 && (
                            <div className="px-6 pb-2 flex gap-3 flex-wrap relative z-10">
                                {uploadedImages.map((img, idx) => (
                                    <div key={idx} className="relative group/img w-20 h-20 rounded-lg overflow-hidden border border-slate-700">
                                        <img 
                                            src={`data:${img.mimeType};base64,${img.data}`} 
                                            alt="upload" 
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="bg-slate-900/50 px-6 py-3 flex items-center justify-between border-t border-slate-800 relative z-10">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
                                    <UploadCloud className="w-4 h-4" />
                                    <span>إرفاق صور (مرجع)</span>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden" 
                                        accept="image/*" 
                                        multiple 
                                    />
                                </label>
                                <span className="text-xs text-slate-500">
                                    {uploadedImages.length > 0 ? `${uploadedImages.length} صور مرفقة` : 'اختياري'}
                                </span>
                            </div>
                            <div className={`text-xs font-mono font-bold ${concept.length >= MAX_CHARS ? 'text-red-500' : 'text-slate-600'}`}>
                                {concept.length} / {MAX_CHARS}
                            </div>
                        </div>
                      </div>

                      {/* Controls Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Aspect Ratio */}
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">أبعاد العمل (Aspect Ratio)</label>
                             <div className="relative">
                                <select 
                                   value={aspectRatio}
                                   onChange={(e) => setAspectRatio(e.target.value)}
                                   className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-900 transition-colors"
                                >
                                   {ASPECT_RATIOS.map(ratio => (
                                      <option key={ratio.id} value={ratio.id}>{ratio.label}</option>
                                   ))}
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                             </div>
                          </div>

                          {/* Art Style */}
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الأسلوب الفني (Art Style)</label>
                             <div className="relative">
                                <select 
                                   value={selectedStyle}
                                   onChange={(e) => setSelectedStyle(e.target.value)}
                                   className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-900 transition-colors"
                                >
                                   {CONTENT_STYLES[contentType]?.map(style => (
                                      <option key={style.id} value={style.id}>{style.label}</option>
                                   ))}
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                             </div>
                          </div>
                          
                           {/* Story Type (Only for Story/Video) */}
                           {contentType !== 'image' && (
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">نوع السرد (Story Type)</label>
                                <div className="relative">
                                    <select 
                                    value={storyType}
                                    onChange={(e) => setStoryType(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-900 transition-colors"
                                    >
                                    {STORY_TYPES.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                             </div>
                          )}

                          {/* Language */}
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">لغة السرد (Narration Language)</label>
                             <div className="relative">
                                <select 
                                   value={selectedLanguage}
                                   onChange={(e) => setSelectedLanguage(e.target.value)}
                                   className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-900 transition-colors"
                                >
                                   {LANGUAGES.map(lang => (
                                      <option key={lang.id} value={lang.id}>{lang.label}</option>
                                   ))}
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                             </div>
                          </div>
                          
                          {/* Dialect (Conditional) */}
                          {selectedLanguage === 'ar' && (
                              <div className="space-y-2 animate-fade-in">
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">اللهجة (Arabic Dialect)</label>
                                 <div className="relative">
                                    <select 
                                       value={selectedDialect}
                                       onChange={(e) => setSelectedDialect(e.target.value)}
                                       className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-900 transition-colors"
                                    >
                                       {DIALECTS.map(d => (
                                          <option key={d.id} value={d.id}>{d.label}</option>
                                       ))}
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                 </div>
                              </div>
                          )}

                           {/* Transitions (Only for Story/Video) */}
                           {contentType !== 'image' && (
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">نوع الانتقالات (Transitions)</label>
                                <div className="relative">
                                    <select 
                                    value={selectedTransition}
                                    onChange={(e) => setSelectedTransition(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-900 transition-colors"
                                    >
                                    {TRANSITION_STYLES.map(style => (
                                        <option key={style.id} value={style.id}>{style.label}</option>
                                    ))}
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                             </div>
                          )}
                      </div>

                      {/* Requirements Hint */}
                      <div className="bg-slate-950/30 rounded-xl p-5 border border-slate-800">
                         <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">نقاط سيتم التركيز عليها تلقائياً لهذا النوع:</h4>
                         <div className="flex flex-wrap gap-2">
                            {CONTENT_GUIDES[contentType].requirements.map((req, i) => (
                               <span key={i} className="text-xs bg-slate-900 text-slate-400 px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${CONTENT_GUIDES[contentType].color.replace('text-', 'bg-')}`}></span>
                                  {req}
                               </span>
                            ))}
                         </div>
                      </div>

                      <button
                        type="submit"
                        disabled={stage === 'analyzing' || (!concept.trim() && uploadedImages.length === 0)}
                        className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                            !concept.trim() && uploadedImages.length === 0 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25 hover:scale-[1.01]'
                        }`}
                      >
                         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        {stage === 'analyzing' ? (
                          <>
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             جاري تحليل الفكرة...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            ابدأ التحليل وتوليد الأسئلة
                          </>
                        )}
                      </button>
                    </form>
                  </div>
              )}

           </div>
        ) : null}

        {/* Stage 2: Questions */}
        {stage === 'questions' && (
          <div className="max-w-3xl mx-auto animate-slide-up">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-white mb-2">مرحلة التدقيق والتفاصيل</h2>
                    <p className="text-slate-400">لضمان أفضل نتيجة، نحتاج لتوضيح بعض النقاط حول فكرتك.</p>
                </div>

                <div className="space-y-8">
                {questions.map((q) => (
                    <div key={q.id} className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 focus-within:border-blue-500/50 transition-colors">
                    <label className="block text-blue-300 font-bold mb-4 text-lg">
                        {q.question_ar}
                    </label>
                    <textarea
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                        placeholder="اكتب إجابتك هنا..."
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        value={answers[q.id] || ""}
                        dir="auto"
                    />
                    </div>
                ))}
                </div>

                <div className="mt-10 flex gap-4">
                    <button
                        onClick={handleFinalGeneration}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-emerald-500/25 shadow-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        <Zap className="w-5 h-5" />
                        توليد البرومبت النهائي
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {stage === 'generating' && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in space-y-8">
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">جاري هندسة الأوامر...</h3>
                <p className="text-slate-400 font-mono text-sm">يتم الآن بناء ملف الشخصيات، المشاهد، والسيناريو.</p>
            </div>
          </div>
        )}

        {/* Stage 3: Results */}
        {stage === 'results' && response && (
          <div className="animate-slide-up space-y-12">
            
            {/* Header / Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-6">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">ملخص المفهوم</span>
                            <h2 className="text-3xl font-bold text-white leading-tight">{response.analysis.concept_summary}</h2>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700">
                                <span className="block text-xs text-slate-500 mb-1">النمط الفني</span>
                                <span className="font-bold text-blue-300">{response.analysis.art_direction}</span>
                            </div>
                            <div className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700">
                                <span className="block text-xs text-slate-500 mb-1">المواصفات التقنية</span>
                                <span className="font-bold text-purple-300 text-sm">{response.analysis.technical_breakdown}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Refinement Section - RESTORED */}
            <div className="bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 border border-violet-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                        <Wand className="w-6 h-6 text-violet-300" />
                    </div>
                    <h3 className="text-xl font-bold text-violet-100">تعديل ذكي بالذكاء الاصطناعي</h3>
                </div>
                <div className="flex gap-3">
                    <input 
                        type="text" 
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        placeholder="اطلب تعديلاً عاماً (مثال: اجعل الجو أكثر رعباً، غير البطل إلى روبوت، اختصر السرد...)"
                        className="flex-1 bg-slate-950/60 border border-violet-500/30 rounded-xl px-5 py-3 text-white placeholder-violet-300/50 focus:ring-2 focus:ring-violet-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleRefinement()}
                    />
                    <button 
                        onClick={handleRefinement}
                        disabled={isRefining || !refineInstruction.trim()}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/20"
                    >
                        {isRefining ? 'جاري التعديل...' : 'نفذ التعديل'}
                    </button>
                </div>
            </div>

            {/* Character Bible */}
            <CharacterCard bible={response.character_bible} />

            {/* Location Assets */}
            {response.location_assets && response.location_assets.length > 0 && (
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
                        <MapPin className="w-6 h-6 text-orange-400" />
                        <h2 className="text-2xl font-bold text-white">الأماكن الثابتة (Fixed Locations)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {response.location_assets.map((loc, idx) => (
                             <div key={idx} className="group relative overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                                 {/* Abstract Background with Parallax effect */}
                                 <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700"></div>
                                     <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 -translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700"></div>
                                     <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                                 </div>
                                 
                                 <div className="relative p-6 backdrop-blur-sm z-10">
                                     <div className="flex justify-between items-start mb-4">
                                         <div className="bg-orange-900/30 p-2 rounded-lg text-orange-400 group-hover:text-white group-hover:bg-orange-500 transition-colors">
                                            <MapPin className="w-6 h-6" />
                                         </div>
                                     </div>
                                     
                                     <div className="mb-4">
                                        <EditableField 
                                            initialValue={loc.name_ar} 
                                            className="text-xl font-bold text-white mb-1" 
                                        />
                                        <EditableField 
                                            initialValue={loc.name_en} 
                                            className="text-sm text-slate-400 font-mono text-left" 
                                        />
                                     </div>
                                     
                                     <EditableField 
                                        initialValue={loc.description} 
                                        multiline={true}
                                        className="text-slate-300 text-sm leading-relaxed mb-6 h-20 overflow-y-auto pr-2 custom-scrollbar" 
                                     />

                                     <PromptDisplay label="MASTER LOCATION PROMPT" content={loc.location_prompt} />
                                 </div>
                             </div>
                        ))}
                    </div>
                 </div>
            )}

            {/* Tabs for Story/Video */}
            <div className="mt-16">
                 <div className="flex border-b border-slate-800 mb-8">
                    <button
                        onClick={() => setActiveTab('storybook')}
                        className={`pb-4 px-6 text-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'storybook' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-emerald-300'}`}
                    >
                        <BookOpen className="w-5 h-5" />
                        القصة المصورة (Storybook)
                    </button>
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`pb-4 px-6 text-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'video' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500 hover:text-purple-300'}`}
                    >
                        <Clapperboard className="w-5 h-5" />
                        فيديو (Video Assets)
                    </button>
                 </div>

                 <div className="animate-fade-in">
                    {activeTab === 'storybook' ? (
                        <div className="space-y-8">
                             <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <h2 className="text-2xl font-black text-emerald-400">"{response.storybook.story_title}"</h2>
                                <div className="text-sm text-slate-400">
                                    <span className="font-bold text-slate-500">نبرة الصوت:</span> {response.storybook.voiceover_tone_ar}
                                </div>
                             </div>

                             {response.storybook.scenes.map((scene, idx) => (
                                <SceneCard key={idx} scene={scene} type="storybook" />
                             ))}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <h2 className="text-2xl font-black text-purple-400">"{response.video.video_title}"</h2>
                                <div className="text-sm text-slate-400">
                                    <span className="font-bold text-slate-500">Voiceover Tone:</span> {response.video.voiceover_tone_ar}
                                </div>
                            </div>

                            {response.video.scenes.map((scene, idx) => (
                                <SceneCard key={idx} scene={scene} type="video" />
                            ))}
                        </div>
                    )}
                 </div>
            </div>
            
            {/* Rating Section - RESTORED */}
            <div className="mt-20 py-10 border-t border-slate-800 flex flex-col items-center justify-center space-y-4">
                <h3 className="text-xl font-bold text-slate-300">كيف كانت تجربتك؟</h3>
                <RatingStars onRate={handleRatingSubmit} />
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 py-8 border-t border-slate-800 mt-12">
               <button onClick={goToQuestions} className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
                  تعديل المدخلات
               </button>
               <button onClick={resetApp} className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30 transition-colors">
                  مشروع جديد
               </button>
            </div>

          </div>
        )}

        <div ref={bottomRef}></div>
      </main>

       {/* Footer */}
       <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
                 <p className="text-sm text-slate-600 font-medium mb-1">
                     جميع الحقوق محفوظة © {new Date().getFullYear()} Edu Design Academy
                 </p>
                 <p className="text-xs text-slate-700 font-mono">
                     Designed by <span className="text-slate-500">Hala Radwan</span>
                 </p>
            </div>
       </footer>

      {error && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur animate-bounce z-50">
          {error}
        </div>
      )}
    </div>
  );
}

export default App;