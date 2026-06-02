// Mock content generator — simulates AI output with deterministic, varied templates.
export type Tone = "Professional" | "Friendly" | "SEO-friendly" | "Luxury" | "Simple";
export type Length = "Short" | "Medium" | "Long";
export type Language =
  | "English"
  | "Roman Urdu"
  | "Urdu"
  | "Spanish"
  | "French"
  | "German"
  | "Italian"
  | "Portuguese"
  | "Arabic"
  | "Hindi"
  | "Chinese (Simplified)"
  | "Japanese"
  | "Korean"
  | "Turkish"
  | "Russian"
  | "Indonesian";

export interface GenerateInput {
  productName: string;
  category: string;
  features: string;
  audience: string;
  tone: Tone;
  length: Length;
  language: Language;
  keywords: string;
}

export interface GeneratedContent {
  description: string;
  highlights: string[];
  metaTitle: string;
  metaDescription: string;
  adCopy: string;
  socialCaption: string;
}

const toneVoice: Record<Tone, { open: string; close: string }> = {
  Professional: { open: "Engineered for performance,", close: "A considered choice for those who demand consistency." },
  Friendly: { open: "Meet your new favorite —", close: "We think you're going to love it." },
  "SEO-friendly": { open: "Discover the best", close: "Shop now and experience the difference." },
  Luxury: { open: "Exquisitely crafted,", close: "An object of quiet, enduring distinction." },
  Simple: { open: "A clean, effective", close: "Made to do the job — nothing more." },
};

const lengthSpec: Record<Length, number> = { Short: 1, Medium: 2, Long: 3 };

const urduOpen: Record<Language, string> = {
  English: "",
  "Roman Urdu": "Pesh hai ek behtareen ",
  Urdu: "پیش ہے ایک بہترین ",
  Spanish: "Presentamos un excelente ",
  French: "Découvrez un excellent ",
  German: "Entdecken Sie ein hervorragendes ",
  Italian: "Scopri un eccellente ",
  Portuguese: "Apresentamos um excelente ",
  Arabic: "نقدم منتجاً ممتازاً ",
  Hindi: "प्रस्तुत है एक बेहतरीन ",
  "Chinese (Simplified)": "为您呈现一款卓越的 ",
  Japanese: "優れた製品をご紹介します ",
  Korean: "뛰어난 제품을 소개합니다 ",
  Turkish: "Mükemmel bir ürün sunuyoruz ",
  Russian: "Представляем превосходный ",
  Indonesian: "Memperkenalkan produk terbaik ",
};

function pickFeature(features: string, i: number): string {
  const arr = features.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  return arr[i % Math.max(arr.length, 1)] || "premium quality";
}

export function generateMockContent(input: GenerateInput): GeneratedContent {
  const { productName, category, features, audience, tone, length, language, keywords } = input;
  const v = toneVoice[tone];
  const para = lengthSpec[length];
  const featList = features
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const kw = keywords
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const langPrefix = urduOpen[language];

  const p1 = `${langPrefix}${v.open} the ${productName} is a ${category.toLowerCase() || "product"} designed for ${audience || "discerning customers"}. Built around ${pickFeature(features, 0)} and ${pickFeature(features, 1)}, it delivers a measured balance of form and function.`;
  const p2 = `Every detail of the ${productName} has been considered — from ${pickFeature(features, 2)} to its overall finish. Whether for daily use or special occasions, it adapts effortlessly to the rhythm of ${audience || "your day"}.`;
  const p3 = `${v.close}`;

  const description = [p1, para >= 2 ? p2 : "", para >= 1 ? p3 : ""].filter(Boolean).join("\n\n");

  const highlights = (featList.length ? featList : ["Premium materials", "Thoughtful design", "Long-lasting build", "Versatile use", "Easy maintenance"])
    .slice(0, 5)
    .map((f) => f.charAt(0).toUpperCase() + f.slice(1));

  const kwTail = kw.length ? ` | ${kw.slice(0, 2).join(", ")}` : "";
  const metaTitle = `${productName} — ${category || "Premium"}${kwTail}`.slice(0, 60);

  const metaDescription = `Shop the ${productName}, a ${tone.toLowerCase()} ${category.toLowerCase() || "product"} for ${audience || "everyone"}. ${pickFeature(features, 0)}, ${pickFeature(features, 1)}.`.slice(0, 158);

  const adCopy = `New: ${productName}. ${pickFeature(features, 0)}, ${pickFeature(features, 1)} — built for ${audience || "you"}. Order today.`;

  const hashtags = (kw.length ? kw : [category, "new", "musthave"])
    .slice(0, 4)
    .map((h) => "#" + h.replace(/\s+/g, ""))
    .join(" ");
  const socialCaption = `Introducing ${productName} ✨\n${pickFeature(features, 0)} · ${pickFeature(features, 1)}\n${hashtags}`;

  return { description, highlights, metaTitle, metaDescription, adCopy, socialCaption };
}

export const TONES: Tone[] = ["Professional", "Friendly", "SEO-friendly", "Luxury", "Simple"];
export const LENGTHS: Length[] = ["Short", "Medium", "Long"];
export const LANGUAGES: Language[] = [
  "English",
  "Roman Urdu",
  "Urdu",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Chinese (Simplified)",
  "Japanese",
  "Korean",
  "Turkish",
  "Russian",
  "Indonesian",
];
