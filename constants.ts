import { ArtStyle, Genre } from "./types";

export const GENRE_DESCRIPTIONS: Record<Genre, string> = {
  [Genre.ACTION]: "타격감 넘치는 액션, 다이내믹한 앵글, 속도감 있는 연출",
  [Genre.ROMANCE]: "감성적인 작화, 인물의 미세한 표정 변화, 설레는 분위기",
  [Genre.SLICE_OF_LIFE]: "편안하고 따뜻한 색감, 공감가는 일상적 묘사",
  [Genre.POLITICS]: "느와르적 긴장감, 무거운 명암 대비, 수트와 실내극",
  [Genre.NOIR]: "차가운 도시의 밤, 강렬한 흑백 대비, 비, 네온 사인",
  [Genre.HORROR]: "기괴한 텍스처, 불안한 구도, 심리적 공포를 자극하는 연출",
  [Genre.FANTASY]: "웅장한 세계관, 마법 효과, 이세계적인 배경과 크리처"
};

export const GENRE_LABELS: Record<Genre, string> = {
  [Genre.ACTION]: "액션/무협",
  [Genre.ROMANCE]: "로맨스/순정",
  [Genre.SLICE_OF_LIFE]: "일상/드라마",
  [Genre.POLITICS]: "정치/스릴러",
  [Genre.NOIR]: "느와르/범죄",
  [Genre.HORROR]: "공포/미스터리",
  [Genre.FANTASY]: "판타지/SF"
};

export const STYLE_PROMPTS: Record<ArtStyle, string> = {
  [ArtStyle.REALISTIC]: "photorealistic, 8k resolution, cinematic lighting, highly detailed texture, korean blockbuster movie style",
  [ArtStyle.ANIME]: "high quality anime style, cel shaded, vibrant colors, makoto shinkai style, detailed background",
  [ArtStyle.CLAY]: "claymation style, plasticine texture, stop motion look, soft shadows, cute and rounded",
  [ArtStyle.MINHWA]: "korean traditional folk painting style, oriental ink painting, hanji paper texture, flat perspective, elegant colors",
  [ArtStyle.WEBTOON_STANDARD]: "premium webtoon style, manhwa style, clean lines, digital coloring, vertical format optimized, high contrast",
  [ArtStyle.SKETCH]: "rough pencil sketch, charcoal, black and white, artistic strokes, storyboard style"
};

export const STYLE_LABELS: Record<ArtStyle, string> = {
  [ArtStyle.REALISTIC]: "실사/시네마틱",
  [ArtStyle.ANIME]: "애니메이션풍",
  [ArtStyle.CLAY]: "클레이/스톱모션",
  [ArtStyle.MINHWA]: "한국화/동양화풍",
  [ArtStyle.WEBTOON_STANDARD]: "프리미엄 웹툰",
  [ArtStyle.SKETCH]: "러프 스케치"
};

export const DEFAULT_PANEL_COUNT = 8; // Increased for better storytelling density

// Static preview image URLs (generated once via scripts/generate-presets.ts)
export const STYLE_PREVIEW_URLS: Record<ArtStyle, string> = {
  [ArtStyle.REALISTIC]: '/previews/styles/realistic-cinematic.png',
  [ArtStyle.ANIME]: '/previews/styles/japanese-anime.png',
  [ArtStyle.CLAY]: '/previews/styles/claymation.png',
  [ArtStyle.MINHWA]: '/previews/styles/korean-minhwa.png',
  [ArtStyle.WEBTOON_STANDARD]: '/previews/styles/webtoon-standard.png',
  [ArtStyle.SKETCH]: '/previews/styles/sketch.png',
};

export const GENRE_PREVIEW_URLS: Record<Genre, string> = {
  [Genre.ACTION]: '/previews/genres/action.png',
  [Genre.ROMANCE]: '/previews/genres/romance.png',
  [Genre.SLICE_OF_LIFE]: '/previews/genres/slice-of-life.png',
  [Genre.POLITICS]: '/previews/genres/politics.png',
  [Genre.NOIR]: '/previews/genres/noir.png',
  [Genre.HORROR]: '/previews/genres/horror.png',
  [Genre.FANTASY]: '/previews/genres/fantasy.png',
};