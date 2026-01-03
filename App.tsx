
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GenerationMode, CombinedResponse, AppStage, Question, ContentType, SavedProject, Scene, VideoScene, SongSegment } from './types';
import { APP_NAME, APP_VERSION, ASPECT_RATIOS, CONTENT_STYLES, LANGUAGES, ARABIC_DIALECTS, ENGLISH_DIALECTS, TRANSITION_STYLES, STORY_TYPES, VIDEO_FORMATS, VIDEO_RESOLUTIONS, MUSIC_GENRES } from './constants';
import { generateUltraPrompt, generateAnalysisQuestions, refineUltraPrompt, rewriteSinglePrompt, ImageData } from './services/geminiService';
import { CharacterCard } from './components/CharacterCard';
import { AdvancedPromptEditor } from './components/AdvancedPromptEditor';
import { EditableNarration } from './components/EditableNarration';
import { EditableField } from './components/EditableField';
import { SceneCard } from './components/SceneCard';
import { SongSegmentCard } from './components/SongSegmentCard';
import { RatingStars } from './components/RatingStars';
import { Sparkles, Zap, Clapperboard, BookOpen, Mic, ImageIcon, MapPin, UploadCloud, Trash2, ArrowLeft, Wand, Archive, FloppyDisk, Check, Edit2, FileJson, MusicNote, User, GoogleIcon, LogOut, Sliders, X, Lock } from './components/Icons';
import { VisualTweakPanel } from './components/VisualTweakPanel';

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
    placeholder: "صف المشهد بدقة: ماذا ترى؟ ما هو جو الصورة؟ الإضاءة؟ الشخصية الرئيسية؟",
    requirements: ["تكوين الصورة", "نوع العدسة", "الإضاءة", "المشاعر"],
    color: "text-blue-400",
    bgGradient: "from-blue-900/50 to-blue-800/50",
    icon: ImageIcon
  },
  story: {
    title: "كتابة القصة المصورة (Storybook)",
    placeholder: "اكتب ملخص القصة: البداية، العقدة، والنهاية. من هم الأبطال؟ وأين تدور الأحداث؟",
    requirements: ["تسلسل الأحداث", "تطور الشخصيات", "الفكرة", "البيئة"],
    color: "text-emerald-400",
    bgGradient: "from-emerald-900/50 to-emerald-800/50",
    icon: BookOpen
  },
  video: {
    title: "إنتاج الفيديو السينمائي (Video Prompts)",
    placeholder: "صف الفيديو: نوع الحركة، المؤثرات البصرية، تتابع اللقطات، والأسلوب السينمائي...",
    requirements: ["حركة الكاميرا", "نوع الحركة", "المؤثرات", "تصميم الصوت"],
    color: "text-purple-400",
    bgGradient: "from-purple-900/50 to-purple-800/50",
    icon: Clapperboard
  },
  song: {
    title: "تصميم الأغاني والموسيقى (Song Design)",
    placeholder: "صف فكرة الأغنية: الموضوع، المشاعر، نوع الموسيقى...",
    requirements: ["هيكل الأغنية", "النوع الموسيقي", "المشاعر", "الفيديو كليب"],
    color: "text-pink-400",
    bgGradient: "from-pink-900/50 to-pink-800/50",
    icon: MusicNote
  }
};

const STORAGE_KEY = 'ultra_system_projects_v2';
const BROWSER_ID_KEY = 'ultra_browser_uid';

function App() {
  const MAX_CHARS = 3000;

  const [userIp, setUserIp] = useState<string>("جاري التحديد...");
  const [browserId, setBrowserId] = useState<string>("");
  const [stage, setStage] = useState<AppStage>('initial');
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.STANDARD);
  const [view, setView] = useState<'app' | 'memory'>('app');
  
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [concept, setConcept] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("ar");
  const [selectedDialect, setSelectedDialect] = useState("msa");
  const [selectedTransition, setSelectedTransition] = useState("Dynamic");
  const [videoResolution, setVideoResolution] = useState("4K");
  const [storyType, setStoryType] = useState("narrative");
  const [videoFormat, setVideoFormat] = useState("standard");
  const [musicGenre, setMusicGenre] = useState("Automatic");
  
  const [isRefining, setIsRefining] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [response, setResponse] = useState<CombinedResponse | null>(null);
  
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize and load from storage
  useEffect(() => {
    let uid = localStorage.getItem(BROWSER_ID_KEY);
    if (!uid) {
        uid = 'ULTRA-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        localStorage.setItem(BROWSER_ID_KEY, uid);
    }
    setBrowserId(uid);

    const fetchIP = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        setUserIp(data.ip);
      } catch (e) {
        setUserIp("Local Network");
      }
    };
    fetchIP();

    const loadProjects = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const projects = JSON.parse(saved);
          if (Array.isArray(projects)) {
            setSavedProjects(projects);
          }
        }
      } catch (e) {
        console.error("Failed to load projects:", e);
      }
    };
    loadProjects();
  }, []);

  const syncWithStorage = useCallback((updatedList: SavedProject[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      setSavedProjects(updatedList);
    } catch (e) {
      console.error("Storage Sync Error:", e);
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        alert("تنبيه: ذاكرة الجهاز ممتلئة. يرجى حذف بعض المشاريع القديمة لحفظ المشروع الجديد.");
      }
    }
  }, []);

  useEffect(() => {
    if (response && contentType) {
      const id = currentProjectId || Date.now().toString();
      
      let title = "مشروع جديد";
      if (contentType === 'video') title = response.video.video_title;
      else if (contentType === 'story') title = response.storybook.story_title;
      else if (contentType === 'song') title = response.song.song_title;

      const project: SavedProject = {
        id,
        timestamp: Date.now(),
        title: title || "مشروع بدون عنوان",
        concept: concept.substring(0, 500),
        contentType,
        response,
        style: selectedStyle,
        ownerIp: userIp,
        browserId: browserId
      };

      const timer = setTimeout(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        let masterList: SavedProject[] = [];
        try {
          masterList = raw ? JSON.parse(raw) : [];
        } catch (e) { masterList = []; }

        const filtered = masterList.filter(p => p.id !== id);
        const updatedList = [project, ...filtered];
        
        syncWithStorage(updatedList);
        if (!currentProjectId) setCurrentProjectId(id);
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [response, contentType, selectedStyle, currentProjectId, userIp, browserId, concept, syncWithStorage]);

  const updateScene = (index: number, updatedScene: Scene | VideoScene) => {
    if (!response) return;
    setResponse(prev => {
        if (!prev) return null;
        const next = { ...prev };
        if (contentType === 'video') {
            next.video.scenes = [...next.video.scenes];
            next.video.scenes[index] = updatedScene as VideoScene;
        } else if (contentType === 'story') {
            next.storybook.scenes = [...next.storybook.scenes];
            next.storybook.scenes[index] = updatedScene as Scene;
        }
        return next;
    });
  };

  const updateCharacter = (index: number, updatedChar: any) => {
    if (!response) return;
    setResponse(prev => {
        if (!prev) return null;
        const next = { ...prev };
        next.character_bible.characters = [...next.character_bible.characters];
        next.character_bible.characters[index] = updatedChar;
        return next;
    });
  };

  const updateSongSegment = (index: number, updatedSegment: SongSegment) => {
    if (!response) return;
    setResponse(prev => {
        if (!prev) return null;
        const next = { ...prev };
        next.song.lyrics_structure = [...next.song.lyrics_structure];
        next.song.lyrics_structure[index] = updatedSegment;
        return next;
    });
  };

  const handleContentTypeSelect = (type: ContentType) => {
    setContentType(type);
    setConcept("");
    setCurrentProjectId(null);
    setResponse(null);
    setUploadedImages([]); 
    if (CONTENT_STYLES[type] && CONTENT_STYLES[type].length > 0) {
        setSelectedStyle(CONTENT_STYLES[type][0].id);
    }
    setTimeout(() => { formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (base64String) {
             const base64Data = base64String.split(',')[1];
             setUploadedImages(prev => [...prev, { mimeType: file.type, data: base64Data }]);
        }
      };
      reader.readAsDataURL(file);
    });
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
      setError("حدث خطأ أثناء تحليل المفهوم. يرجى إعادة المحاولة.");
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
    const qaContext: Record<string, string> = {};
    questions.forEach(q => { qaContext[q.question_ar] = answers[q.id] || "تلقائي"; });
    qaContext['content_type'] = contentType;
    try {
      const result = await generateUltraPrompt(concept, qaContext, mode, aspectRatio, selectedStyle, selectedLanguage, selectedDialect, selectedTransition, storyType, uploadedImages, videoFormat, videoResolution, musicGenre);
      setResponse(result);
      setStage('results');
    } catch (err) {
      setError("فشل في إنشاء الاستجابة النهائية. يرجى التحقق من الاتصال والمحاولة مرة أخرى.");
      setStage('questions');
    }
  };

  const handleGlobalRefine = async (instruction: string) => {
      if (!response || !instruction.trim()) return;
      setIsRefining(true);
      try {
          const refinedResponse = await refineUltraPrompt(response, instruction, uploadedImages);
          setResponse(refinedResponse);
          setUploadedImages([]); 
      } catch (e) {
          alert("حدث خطأ أثناء التعديل.");
      } finally {
          setIsRefining(false);
      }
  };

  const handleLoadProject = (project: SavedProject) => {
      setCurrentProjectId(project.id);
      setResponse(project.response);
      setConcept(project.concept); 
      setContentType(project.contentType);
      setSelectedStyle(project.style);
      setStage('results');
      setView('app');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedProjects.filter(p => p.id !== id);
    syncWithStorage(updated);
    if (currentProjectId === id) {
        setCurrentProjectId(null);
        setResponse(null);
        setStage('initial');
    }
    setDeleteConfirmId(null);
  };

  const fullReset = () => {
    setStage('initial');
    setConcept("");
    setQuestions([]);
    setAnswers({});
    setResponse(null);
    setCurrentProjectId(null);
    setError(null);
    setUploadedImages([]);
    setContentType(null);
    setView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (stage !== 'initial' && view === 'app') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stage, questions, view]);

  const LoadingScreen = ({ message, submessage }: { message: string, submessage: string }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-fade-in">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
        </div>
        <div className="space-y-3">
            <h3 className="text-3xl font-black text-white">{message}</h3>
            <p className="text-slate-400 max-w-md mx-auto">{submessage}</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans" dir="rtl">
      
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-6 py-3 rounded-full shadow-2xl border border-emerald-500/50 flex items-center gap-3 z-50 animate-slide-up backdrop-blur-md">
            <div className="bg-emerald-500/20 p-1.5 rounded-full"><Check className="w-4 h-4 text-emerald-400" /></div>
            <span className="font-bold text-sm">تم الحفظ في الذاكرة الإبداعية المرتبطة بـ IP الخاص بك</span>
        </div>
      )}

      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={fullReset}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform"><Sparkles className="text-white w-5 h-5" /></div>
            <div>
              <h1 className="text-xl font-black text-white">{APP_NAME}</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest text-left uppercase" dir="ltr">Connected: {userIp}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network Identity</span>
                <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> {userIp}</span>
             </div>
             <button 
                onClick={() => setView(view === 'app' ? 'memory' : 'app')} 
                className={`p-2.5 rounded-xl transition-all relative ${view === 'memory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'hover:bg-slate-800 text-slate-400 border border-slate-800'}`}
                title="الذاكرة الإبداعية"
             >
                <Archive className="w-5 h-5" />
                {savedProjects.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-slate-950 text-white">{savedProjects.length}</span>}
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {view === 'memory' ? (
            <div className="animate-fade-in space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800 pb-8">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600/20 rounded-2xl text-blue-400 border border-blue-500/20"><Archive className="w-10 h-10" /></div>
                        <div>
                            <h2 className="text-3xl font-black text-white">الذاكرة الإبداعية</h2>
                            <p className="text-sm text-slate-500 font-medium">مشاريعك المحفوظة محلياً والمؤمنة بـ IP الخاص بك</p>
                        </div>
                     </div>
                     
                     <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Lock className="w-6 h-6" /></div>
                        <div>
                           <span className="text-[10px] font-black text-slate-500 uppercase block">Verified IP Identity</span>
                           <span className="text-sm font-mono text-white font-bold">{userIp}</span>
                           <div className="flex items-center gap-1 mt-0.5"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> <span className="text-[9px] text-emerald-500/80 font-bold uppercase">Memory Linked</span></div>
                        </div>
                     </div>
                 </div>

                 {savedProjects.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/40 rounded-3xl border-2 border-slate-800 border-dashed">
                        <Archive className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-slate-500">لا توجد مشاريع سابقة مرتبطة بهذا الجهاز</h3>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedProjects.map(project => (
                            <div key={project.id} onClick={() => handleLoadProject(project)} className={`group bg-slate-900 border-2 rounded-2xl p-6 transition-all cursor-pointer relative ${currentProjectId === project.id ? 'border-blue-500 shadow-xl shadow-blue-900/20' : 'border-slate-800 hover:border-blue-500/50'}`}>
                                <div className="flex justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${project.contentType === 'video' ? 'bg-purple-900/30 text-purple-400' : project.contentType === 'song' ? 'bg-pink-900/30 text-pink-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                        {project.contentType === 'video' ? <Clapperboard className="w-5 h-5" /> : project.contentType === 'song' ? <MusicNote className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(project.id); }} className="text-slate-600 hover:text-red-400 p-2 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                </div>
                                <h3 className="text-xl font-black text-white mb-2 line-clamp-1">{project.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{project.concept}</p>
                                
                                <div className="flex items-center justify-between mt-4 border-t border-slate-800 pt-3">
                                    <div className="flex flex-col">
                                       <p className="text-[10px] text-slate-500 font-mono">{new Date(project.timestamp).toLocaleString('ar-EG')}</p>
                                       <span className="text-[9px] text-emerald-600 font-mono flex items-center gap-1"><Lock className="w-2 h-2" /> {project.ownerIp === userIp ? 'Matches Identity' : project.ownerIp}</span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-blue-500 px-2 py-0.5 bg-blue-500/10 rounded">{project.style}</span>
                                </div>
                                
                                {deleteConfirmId === project.id && (
                                    <div className="absolute inset-0 bg-slate-950/95 z-20 flex flex-col items-center justify-center p-4 rounded-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                        <p className="text-white text-sm font-bold mb-4 text-center">هل أنت متأكد من حذف هذا المشروع من ذاكرة الـ IP الحالية؟</p>
                                        <div className="flex gap-2 w-full">
                                            <button onClick={(e) => handleDeleteProject(e, project.id)} className="flex-1 bg-red-600 py-2 rounded-lg text-xs font-black">نعم، حذف</button>
                                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-slate-800 py-2 rounded-lg text-xs font-black">إلغاء</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                 )}
            </div>
        ) : (
        <>
        {stage === 'initial' && (
           <div className="animate-fade-in-up">
              <div className="text-center mb-16 space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-normal text-blue-300 mb-6 leading-tight font-decorative">من فكرة إلي ابداع مع Edu Design Academy</h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">سيتم ربط إنتاجك بـ IP الخاص بك لضمان ذاكرة حفظ طويلة المدى وتوحيد الهوية البصرية.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                  {['image', 'story', 'video', 'song'].map((type) => (
                    <button key={type} onClick={() => handleContentTypeSelect(type as ContentType)} className={`group relative overflow-hidden rounded-2xl p-8 border-2 text-right transition-all duration-300 hover:-translate-y-2 shadow-2xl ${contentType === type ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/50' : 'bg-slate-800 border-slate-800 shadow-black/20'}`}>
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${CONTENT_GUIDES[type as ContentType].bgGradient} transform origin-left transition-transform ${contentType === type ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                        <div className="relative z-10 flex flex-col items-start h-full"><div className={`p-4 rounded-xl mb-6 ${contentType === type ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>{React.createElement(CONTENT_GUIDES[type as ContentType].icon, {className:"w-10 h-10"})}</div><h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400">{CONTENT_GUIDES[type as ContentType].title}</h3></div>
                    </button>
                  ))}
              </div>

              {contentType && (
                  <div ref={formRef} className="animate-fade-in-up bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <form onSubmit={handleStartAnalysis} className="space-y-8">
                      <div className="relative group bg-slate-950/50 border-2 border-slate-800 rounded-2xl transition-all focus-within:border-slate-600 overflow-hidden">
                        <textarea value={concept} onChange={(e) => setConcept(e.target.value)} placeholder={CONTENT_GUIDES[contentType].placeholder} maxLength={MAX_CHARS} className="w-full bg-transparent text-slate-200 p-6 text-lg min-h-[160px] resize-y" dir="auto" />
                        
                        {uploadedImages.length > 0 && (
                          <div className="flex gap-4 p-4 bg-slate-900/80 border-t border-slate-800 overflow-x-auto">
                            {uploadedImages.map((img, idx) => (
                              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-blue-500/30 flex-shrink-0">
                                <img src={`data:${img.mimeType};base64,${img.data}`} alt="Upload" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-500">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="bg-slate-900/50 px-6 py-3 flex items-center justify-between border-t border-slate-800">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                                <UploadCloud className="w-4 h-4" /><span>إرفاق صور مرجعية (Visual DNA)</span><input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
                            </label>
                            <div className="text-xs font-mono font-bold text-slate-600">{concept.length} / {MAX_CHARS}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">الاستايل</label>
                            <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-transparent text-sm text-slate-300 font-bold outline-none">
                               {CONTENT_STYLES[contentType]?.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.label}</option>)}
                            </select>
                         </div>
                         <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">اللغة</label>
                            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full bg-transparent text-sm text-slate-300 font-bold outline-none">
                               {LANGUAGES.map(l => <option key={l.id} value={l.id} className="bg-slate-900">{l.label}</option>)}
                            </select>
                         </div>
                         <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">اللهجة</label>
                            <select value={selectedDialect} onChange={(e) => setSelectedDialect(e.target.value)} className="w-full bg-transparent text-sm text-slate-300 font-bold outline-none">
                               {(selectedLanguage === 'ar' ? ARABIC_DIALECTS : ENGLISH_DIALECTS).map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.label}</option>)}
                            </select>
                         </div>
                      </div>

                      <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-900/30">
                        بدء استنساخ الهوية بـ IP: {userIp}
                      </button>
                    </form>
                  </div>
              )}
           </div>
        )}

        {stage === 'analyzing' && (
            <LoadingScreen 
                message="جاري تحليل الصور والمفهوم..." 
                submessage="نقوم باستخراج الـ Visual Blueprint من الصور المرفقة لضمان دقة نقل التفاصيل."
            />
        )}
        
        {stage === 'questions' && (
           <div className="animate-fade-in max-w-3xl mx-auto">
              <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-white mb-2">تأكيد تفاصيل الاستنساخ</h2>
                  <p className="text-slate-400">حدد الخصائص التي تود نقلها من الصور المرفوعة:</p>
                  {error && (
                      <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-bold flex items-center gap-3 justify-center">
                          <Zap className="w-4 h-4" /> {error}
                      </div>
                  )}
              </div>
              <div className="space-y-6">
                 {questions.map((q) => (
                    <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                       <h3 className="text-xl font-bold text-white mb-4 flex gap-3"><span className="text-blue-500">#{q.id}</span>{q.question_ar}</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, idx) => (<button key={idx} onClick={() => handleAnswerChange(q.id, opt)} className={`p-4 rounded-xl text-right text-sm font-medium transition-all ${answers[q.id] === opt ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{opt}</button>))}
                       </div>
                    </div>
                 ))}
                 <button onClick={handleFinalGeneration} className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-xl mt-8 flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/30">
                    توليد المشروع الموحد
                 </button>
              </div>
           </div>
        )}

        {stage === 'generating' && (
            <LoadingScreen 
                message="جاري بناء العالم المرئي..." 
                submessage="يتم الآن دمج تفاصيل الصور المرجعية في البرومبتات التقنية لضمان الثبات."
            />
        )}

        {stage === 'results' && response && (
            <div className="animate-fade-in space-y-8">
                <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white">
                                {contentType === 'song' ? response.song.song_title : 
                                 contentType === 'video' ? response.video.video_title : response.storybook.story_title}
                            </h2>
                            <p className="text-xs text-emerald-500 font-mono tracking-tighter flex items-center gap-1"><Lock className="w-3 h-3" /> VERIFIED IDENTITY: {userIp}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={fullReset} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm border border-slate-700 transition-all flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> مشروع جديد
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl">
                    <h3 className="text-lg font-black text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2"><Zap className="w-5 h-5" /> تحليل الهوية المرئية (DNA)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                          <span className="block text-xs font-black text-blue-500 mb-3 uppercase">الخصائص المستخرجة</span>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium">{response.analysis.technical_breakdown}</p>
                        </div>
                        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 overflow-hidden md:col-span-2">
                          <span className="block text-xs font-black text-emerald-500 mb-3 uppercase">البصمة المرئية الموحدة (Visual Blueprint)</span>
                          <p className="text-[10px] text-emerald-400 font-mono font-bold break-all p-3 bg-emerald-950/20 rounded border border-emerald-900/50">{response.character_bible.characters[0]?.visual_identity}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-blue-500/20">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-blue-400">تعديل احترافي أو نقل تفاصيل من صورة جديدة:</span>
                        <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-lg border border-slate-700 text-xs font-bold transition-all flex items-center gap-2">
                            <UploadCloud className="w-4 h-4" /> رفع صورة جديدة <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
                        </label>
                     </div>
                     {uploadedImages.length > 0 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto p-2">
                           {uploadedImages.map((img, idx) => (
                             <div key={idx} className="relative w-16 h-16 rounded border border-blue-500 shadow-lg flex-shrink-0">
                               <img src={`data:${img.mimeType};base64,${img.data}`} className="w-full h-full object-cover" />
                               <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"><X className="w-2 h-2" /></button>
                             </div>
                           ))}
                        </div>
                     )}
                     <VisualTweakPanel onApply={handleGlobalRefine} isProcessing={isRefining} />
                  </div>
                </div>

                <CharacterCard bible={response.character_bible} onUpdate={(idx, char) => updateCharacter(idx, char)} />

                <div className="space-y-6">
                  {contentType === 'song' ? (
                     <div className="space-y-6">
                        {response.song.lyrics_structure.map((segment, idx) => (
                           <SongSegmentCard key={idx} segment={segment} index={idx} onUpdate={(seg) => updateSongSegment(idx, seg)} />
                        ))}
                     </div>
                  ) : (
                     <div className="space-y-6">
                        {(contentType === 'video' ? response.video.scenes : response.storybook.scenes).map((scene, idx) => (
                            <SceneCard key={idx} scene={scene} type={contentType === 'video' ? 'video' : 'storybook'} index={idx} onUpdate={(s) => updateScene(idx, s)} />
                        ))}
                     </div>
                  )}
                </div>
            </div>
        )}
        <div className="h-24"></div><div ref={bottomRef}></div>
        </>
        )}
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/50 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-slate-500 text-sm font-bold">
            حقوق الطبع محفوظة لـ <span className="text-blue-400">Edu Design Academy</span>
          </p>
          <div className="flex items-center justify-center gap-4">
             <div className="h-px w-8 bg-slate-800"></div>
             <p className="text-slate-600 text-xs font-black uppercase tracking-[0.3em] font-mono" dir="ltr">
               Hala Radwan
             </p>
             <div className="h-px w-8 bg-slate-800"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
