// ============================================
// Professional Style Prompts for Webtoon Generation
// 웹툰 생성을 위한 프로페셔널 스타일 프롬프트
// ============================================

export enum ArtStyle {
  REALISTIC = 'Realistic Cinematic',
  ANIME = 'Japanese Anime',
  CLAY = 'Claymation / Stop Motion',
  MINHWA = 'Korean Folk Painting (Minhwa)',
  WEBTOON_STANDARD = 'Standard Webtoon / Manhwa',
  SKETCH = 'Black and White Sketch'
}

export interface StylePromptConfig {
  base: string;
  linework: {
    outline: string;
    detail: string;
    technique: string;
  };
  coloring: {
    method: string;
    shadows: string;
    highlights: string;
    skin: string;
  };
  lighting: {
    primary: string;
    secondary: string;
    rim: string;
    ambient: string;
  };
  negativePrompt: string;
}

export const ADVANCED_STYLE_PROMPTS: Record<ArtStyle, StylePromptConfig> = {
  [ArtStyle.WEBTOON_STANDARD]: {
    base: `professional Korean webtoon illustration style,
clean vector-like line art with variable line weight,
smooth digital cel-shading with 3-layer gradient,
vibrant saturated colors with high value contrast,
vertical format optimized for mobile viewing`,

    linework: {
      outline: "bold confident strokes 3-5px main outline, tapered line endings for dynamic flow",
      detail: "fine hairline strokes 1-2px for facial features, eyelashes and hair strands",
      technique: "line weight variation following light source - thicker on shadow side, thinner on highlight"
    },

    coloring: {
      method: "anime cel-shading with soft edge blending, 3 value levels (base, shadow, highlight)",
      shadows: "cool-tinted shadows with blue/purple undertone, 20-30% darker than base color",
      highlights: "warm rim light on edges, specular highlights on eyes and hair, cross pattern hair shine",
      skin: "warm peachy base tone, pink undertones on cheeks/nose/ears, subtle subsurface scattering effect"
    },

    lighting: {
      primary: "45-degree top-front key light, clear directional shadow",
      secondary: "soft fill light from opposite side at 30% intensity",
      rim: "strong back rim light for character separation from background",
      ambient: "environmental color reflection on shadow areas"
    },

    negativePrompt: "blurry, low quality, jpeg artifacts, watermark, signature, text on image, deformed anatomy"
  },

  [ArtStyle.ANIME]: {
    base: `high-end Japanese anime illustration quality,
Makoto Shinkai / Kyoto Animation inspired aesthetic,
luminous atmospheric lighting with god rays,
detailed background art with depth of field,
expressive anime eyes with multiple highlight layers,
flowing dynamic hair with individual strand detail`,

    linework: {
      outline: "clean precise lines 2-3px, consistent thickness with slight variation",
      detail: "intricate eye detail with multiple shine layers, delicate eyelash rendering",
      technique: "smooth confident strokes, minimal line variation for clean look"
    },

    coloring: {
      method: "soft cel-shading with gradient transitions, multiple shadow layers",
      shadows: "cool purple/blue shadows, soft ambient occlusion",
      highlights: "bright specular highlights, lens flare effects, bloom on light sources",
      skin: "soft pink-beige tones, airbrushed blush effect"
    },

    lighting: {
      primary: "dramatic golden hour lighting or soft diffused daylight",
      secondary: "strong environmental color bounce",
      rim: "ethereal backlight creating character glow",
      ambient: "atmospheric haze and light particles"
    },

    negativePrompt: "Western cartoon style, flat colors, rough lines, low detail"
  },

  [ArtStyle.REALISTIC]: {
    base: `photorealistic digital painting,
8K resolution cinematic quality,
Korean blockbuster movie visual style,
highly detailed texture and material rendering,
dramatic cinematic lighting setup`,

    linework: {
      outline: "subtle edge definition through value contrast rather than lines",
      detail: "pore-level skin detail, individual hair strands, fabric texture",
      technique: "painterly blending, no visible linework"
    },

    coloring: {
      method: "realistic color theory with subsurface scattering",
      shadows: "naturalistic shadows with bounce light, ambient occlusion",
      highlights: "physically accurate specular highlights on wet/shiny surfaces",
      skin: "realistic skin tones with blood vessel visibility, natural variation"
    },

    lighting: {
      primary: "3-point cinematic lighting setup",
      secondary: "realistic light falloff following inverse square law",
      rim: "motivated practical lighting from story elements",
      ambient: "HDR environment lighting"
    },

    negativePrompt: "cartoon, anime, flat colors, visible brush strokes, stylized"
  },

  [ArtStyle.CLAY]: {
    base: `claymation stop motion style,
plasticine texture with visible fingerprints,
soft shadows and cute rounded forms,
Laika/Aardman animation inspired,
miniature set design aesthetic`,

    linework: {
      outline: "soft organic edges from clay material",
      detail: "subtle texture impressions, clay seams visible",
      technique: "sculptural form definition"
    },

    coloring: {
      method: "matte clay material colors, slightly desaturated",
      shadows: "soft diffused shadows from studio lighting",
      highlights: "subtle waxy highlights on clay surface",
      skin: "smooth clay tone with slight texture"
    },

    lighting: {
      primary: "soft box studio lighting",
      secondary: "bounce cards for fill",
      rim: "subtle edge definition",
      ambient: "warm studio environment"
    },

    negativePrompt: "flat 2D, digital clean, sharp edges, photorealistic"
  },

  [ArtStyle.MINHWA]: {
    base: `Korean traditional folk painting (민화) style,
oriental ink painting aesthetic,
hanji paper texture background,
flat perspective with decorative composition,
elegant muted color palette with bold accents`,

    linework: {
      outline: "brush stroke line work varying from thin to thick",
      detail: "decorative pattern details in clothing and background",
      technique: "traditional Korean brush techniques, flowing calligraphic lines"
    },

    coloring: {
      method: "flat color blocks with mineral pigment appearance",
      shadows: "minimal shading, decorative shadow patterns",
      highlights: "gold leaf accents, white space as highlight",
      skin: "flat warm tone with minimal modeling"
    },

    lighting: {
      primary: "flat ambient lighting, no strong directional source",
      secondary: "decorative light patterns",
      rim: "outline-based separation",
      ambient: "even illumination throughout"
    },

    negativePrompt: "3D rendering, photorealistic, western art style, harsh shadows"
  },

  [ArtStyle.SKETCH]: {
    base: `rough pencil sketch storyboard style,
charcoal and graphite texture,
black and white with grayscale tones,
artistic expressive strokes,
raw unfinished aesthetic`,

    linework: {
      outline: "rough gestural lines with construction marks visible",
      detail: "hatching and cross-hatching for texture",
      technique: "confident sketchy strokes, multiple passes for emphasis"
    },

    coloring: {
      method: "grayscale values only, pencil shading",
      shadows: "hatched shadow areas, varying line density",
      highlights: "paper white as highlight, erased areas",
      skin: "medium gray tone with textured shading"
    },

    lighting: {
      primary: "dramatic contrast for mood",
      secondary: "lost edges in shadow",
      rim: "strong backlight for silhouette",
      ambient: "atmospheric hatching"
    },

    negativePrompt: "color, clean lines, finished polished look, digital"
  }
};

// Build complete style prompt for panel generation
export function buildStylePrompt(style: ArtStyle): string {
  const config = ADVANCED_STYLE_PROMPTS[style];

  return `[VISUAL STYLE - CRITICAL]

BASE AESTHETIC:
${config.base}

LINE WORK REQUIREMENTS:
- Outline: ${config.linework.outline}
- Detail Lines: ${config.linework.detail}
- Technique: ${config.linework.technique}

COLORING METHOD:
- Method: ${config.coloring.method}
- Shadows: ${config.coloring.shadows}
- Highlights: ${config.coloring.highlights}
- Skin Tones: ${config.coloring.skin}

LIGHTING SETUP:
- Key Light: ${config.lighting.primary}
- Fill Light: ${config.lighting.secondary}
- Rim Light: ${config.lighting.rim}
- Ambient: ${config.lighting.ambient}

AVOID: ${config.negativePrompt}`;
}
