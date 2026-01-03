
import { GenerationMode } from './types';

export const APP_NAME = "ULTRA PROMPT // SYSTEM";
export const APP_VERSION = "v2.7.0";

export const DEFAULT_FORM_DATA = {
  concept: "",
  characterBase: "",
  artStyle: "Cinematic, Hyperrealistic, 8k",
  environment: "Futuristic city, Neon lights, Night time",
};

export const MODES = [
  { id: GenerationMode.STANDARD, label: "تحليل قياسي", icon: "🛡️" },
  { id: GenerationMode.ULTRA_EXPERT, label: "وضع الخبير الفائق", icon: "⚡" },
];

export const LANGUAGES = [
  { id: 'ar', label: 'العربية (Arabic)' },
  { id: 'en', label: 'الإنجليزية (English)' },
];

export const ARABIC_DIALECTS = [
  { id: 'msa', label: 'الفصحى (Modern Standard Arabic)' },
  { id: 'egyptian', label: 'المصرية (Egyptian)' },
  { id: 'saudi', label: 'السعودية (Saudi)' },
  { id: 'levantine', label: 'الشامية (Levantine)' },
  { id: 'gulf', label: 'الخليجية (Gulf General)' },
  { id: 'moroccan', label: 'المغربية (Moroccan)' },
  { id: 'iraqi', label: 'العراقية (Iraqi)' },
];

export const ENGLISH_DIALECTS = [
  { id: 'us', label: 'الأمريكية (American English)' },
  { id: 'uk', label: 'البريطانية (British English)' },
];

export const ASPECT_RATIOS = [
  { id: "16:9", label: "سينمائي أفقي (16:9) - YouTube/Movies" },
  { id: "9:16", label: "طولي (9:16) - Reels/TikTok/Shorts" },
  { id: "1:1", label: "مربع (1:1) - Instagram Post" },
  { id: "4:3", label: "تلفزيوني كلاسيكي (4:3)" },
  { id: "2.39:1", label: "شاشة عريضة جداً (2.39:1) - Epic Cinema" }
];

export const VIDEO_RESOLUTIONS = [
  { id: '1080p', label: 'Full HD (1080p)' },
  { id: '4K', label: 'Ultra HD (4K)' },
  { id: '8K', label: '8K Resolution' },
];

export const TRANSITION_STYLES = [
  { id: 'Dynamic', label: 'تلقائي / ذكي (AI Decides)' },
  { id: 'Fast Cut', label: 'قطع سريع (Fast Cut)' },
  { id: 'Slow Fade', label: 'تلاشي بطيء (Slow Fade)' },
  { id: 'Dissolve', label: 'تلاشي متداخل (Dissolve)' },
  { id: 'Wipe', label: 'مسح (Wipe)' },
  { id: 'Whip Pan', label: 'حركة خاطفة (Whip Pan)' },
];

export const STORY_TYPES = [
  { id: 'narrative', label: 'قصة سردية (Narrative)' },
  { id: 'dialogue', label: 'قصة حوارية (Dialogue)' },
];

export const VIDEO_FORMATS = [
  { id: 'standard', label: 'فيديو عادي (Standard Video)' },
  { id: 'reels', label: 'ريلز / تيك توك (Reels / Shorts)' },
];

export const MUSIC_GENRES = [
  { id: "Automatic", label: "تلقائي (Automatic) - AI Choice" },
  { id: "Pop", label: "بوب (Pop)" },
  { id: "Cinematic Orchestral", label: "أوركسترا سينمائية (Cinematic)" },
  { id: "Hip Hop / Rap", label: "هيب هوب / راب (Hip Hop)" },
  { id: "Electronic / EDM", label: "إلكتروني (EDM)" },
  { id: "Acoustic Folk", label: "أكوستيك (Acoustic)" },
  { id: "Arabic Pop", label: "بوب عربي (Arabic Pop)" },
  { id: "Khaleeji", label: "خليجي (Khaleeji)" },
  { id: "Shaabi", label: "شعبي مصري (Shaabi)" },
  { id: "Lo-Fi", label: "لو-فاي (Lo-Fi)" },
  { id: "Rock", label: "روك (Rock)" }
];

export const CONTENT_STYLES = {
  image: [
    { id: "Realistic", label: "واقعي (Realistic)", desc: "صورة طبيعية تحاكي الواقع، ألوان حقيقية" },
    { id: "3D Pixar", label: "ثلاثي الأبعاد (Pixar Style)", desc: "شخصيات كرتونية لطيفة، إضاءة ناعمة، ريندر 3D" },
    { id: "Cinematic", label: "سينمائي (Cinematic)", desc: "إضاءة درامية، عمق مجال ضحل، جودة أفلام" },
    { id: "Hyperrealistic", label: "واقعي جداً (Hyperrealistic)", desc: "تفاصيل دقيقة، 8K، تصوير فوتوغرافي عالي الدقة" },
    { id: "Anime", label: "أنمي/مانغا (Anime)", desc: "أسلوب الرسوم المتحركة اليابانية، ألوان زاهية" },
    { id: "Digital Art", label: "فن رقمي (Digital Art)", desc: "ستايل ArtStation، ريندر ثلاثي الأبعاد" },
    { id: "Oil Painting", label: "لوحة زيتية (Oil Painting)", desc: "ملمس الفرشاة، كلاسيكي، فني" },
    { id: "Cyberpunk", label: "سايبر بانك (Cyberpunk)", desc: "أضواء نيون، مستقبلي، تكنولوجيا فائقة" },
    { id: "Vintage", label: "عتيق (Vintage/Retro)", desc: "تصوير قديم، أبيض وأسود أو سيبيا" },
    { id: "Minimalist", label: "تبسيطي (Minimalist)", desc: "نظيف، مساحات فارغة، تركيز على الموضوع" }
  ],
  story: [
    { id: "3D Pixar", label: "ثلاثي الأبعاد (Pixar Style)", desc: "لطيف، ألوان زاهية، إضاءة ناعمة" },
    { id: "Realistic Drama", label: "قصة واقعية (Realistic)", desc: "شخصيات وبيئات حقيقية، دراما واقعية" },
    { id: "Watercolor", label: "ألوان مائية (Watercolor)", desc: "ناعم، حالم، كلاسيكي لقصص الأطفال" },
    { id: "Comic Book", label: "قصص مصورة (Comic Book)", desc: "خطوط عريضة، تباين عالي، ديناميكي" },
    { id: "Dark Fantasy", label: "فانتازيا مظلمة (Dark Fantasy)", desc: "غوامض، أجواء سحرية، تفاصيل كثيفة" },
    { id: "Vector Art", label: "فيكتور (Flat Design)", desc: "بسيط، أشكال هندسية، ألوان صريحة" },
    { id: "Sketch", label: "رسم يدوي (Pencil Sketch)", desc: "رسم بالقلم الرصاص، غير ملون، فني" },
    { id: "Paper Cutout", label: "قصاصات ورقية (Paper Cutout)", desc: "طبقات، ظلال، ملمس ورقي" }
  ],
  video: [
    { id: "Realistic", label: "فيديو واقعي (Realistic)", desc: "لقطات طبيعية، كأنها مصورة بكاميرا حقيقية" },
    { id: "3D Pixar", label: "أنيميشن بيكسار (Pixar Style)", desc: "رسوم متحركة ثلاثية الأبعاد بأسلوب بيكسار وديزني" },
    { id: "Hollywood Cinematic", label: "سينما هوليوود (Hollywood)", desc: "إنتاج ضخم، تدرج لوني احترافي" },
    { id: "Documentary", label: "وثائقي (Documentary)", desc: "كاميرا محمولة، واقعي، إضاءة طبيعية" },
    { id: "3D Animation", label: "أنيميشن (Unreal Engine 5)", desc: "رسوم متحركة واقعية جداً، انسيابية" },
    { id: "Retro VHS", label: "شريط قديم (Retro VHS)", desc: "تشويش، تسعينات، ألوان باهتة" },
    { id: "Drone Footage", label: "تصوير جوي (Drone)", desc: "لقطات واسعة من الأعلى، حركية" },
    { id: "GoPro Action", label: "حركة سريعة (Action Cam)", desc: "زاوية واسعة جداً، منظور الشخص الأول" },
    { id: "Slow Motion", label: "حركة بطيئة (Slow Motion)", desc: "تركيز على التفاصيل، درامي" }
  ],
  song: [
    { id: "3D Pixar", label: "فيديو كليب كرتوني (3D Pixar Style)", desc: "شخصيات لطيفة، رسوم متحركة 3D للأطفال أو المرح" },
    { id: "Cinematic Music Video", label: "فيديو كليب سينمائي (Cinematic)", desc: "إضاءة درامية، تصوير احترافي، جودة عالية" },
    { id: "Neon/Cyberpunk", label: "نيون / سايبر بانك (Neon)", desc: "أضواء ساطعة، أجواء ليلية، مناسب للراب أو الإلكتروني" },
    { id: "Anime Style", label: "أنمي (Anime)", desc: "رسوم متحركة يابانية، حركة سريعة، ألوان زاهية" },
    { id: "Abstract Visuals", label: "تجريدي (Abstract)", desc: "أشكال هندسية، ألوان تتحرك مع الإيقاع، غير قصصي" },
    { id: "Vintage/Retro", label: "كلاسيكي قديم (Vintage)", desc: "أجواء الثمانينات أو التسعينات، فلتر قديم" },
    { id: "Realistic Performance", label: "أداء واقعي (Realistic)", desc: "تركيز على المغني وهو يؤدي الأغنية في مكان واقعي" }
  ]
};
