// ============================================
// Professional Genre Directing System
// 장르별 연출 시스템
// ============================================

export enum Genre {
  ACTION = 'Action',
  ROMANCE = 'Romance',
  SLICE_OF_LIFE = 'Slice of Life',
  POLITICS = 'Politics',
  NOIR = 'Noir',
  HORROR = 'Horror',
  FANTASY = 'Fantasy'
}

export interface GenreDirectingConfig {
  visualSignature: string[];
  cameraWork: {
    establishing: string;
    buildup: string[];
    climax: string[];
    aftermath: string;
  };
  colorPalette: {
    base: string;
    accent: string;
    mood: string;
  };
  effects: string[];
  dialogueStyle: {
    normal: string;
    emphasis: string;
    internal: string;
  };
  pacing: string;
}

export const GENRE_DIRECTING: Record<Genre, GenreDirectingConfig> = {
  [Genre.ACTION]: {
    visualSignature: [
      "dynamic diagonal compositions with strong directional flow",
      "speed lines (효과선) radiating from impact or movement",
      "motion blur on fast-moving elements creating sense of velocity",
      "impact frames with white flash and debris particles",
      "dramatic foreshortening on punches, kicks, and weapons",
      "high contrast lighting with sharp shadows"
    ],

    cameraWork: {
      establishing: "wide establishing shot showing arena, battlefield, or confrontation space",
      buildup: [
        "medium shot - fighters sizing each other, tension building",
        "close-up on eyes - showing determination, intent, or fear",
        "dutch angle (tilted frame) - rising tension and instability"
      ],
      climax: [
        "extreme close-up on fist, weapon, or point of impact",
        "worm's eye view (looking up) for towering powerful moments",
        "freeze frame at exact moment of contact",
        "zoom burst radiating from impact point"
      ],
      aftermath: "wide shot showing result - victor standing, dust settling, environmental damage"
    },

    colorPalette: {
      base: "high contrast saturated colors, bold primaries",
      accent: "complementary color clash at impact (orange vs blue, red vs cyan)",
      mood: "warm aggressive tones during action, cool tones during calm"
    },

    effects: [
      "speed_lines: parallel motion lines streaming from movement direction",
      "impact_burst: radial explosion lines from contact point, star pattern",
      "aura_effect: flowing energy around character, flame-like wisps"
    ],

    dialogueStyle: {
      normal: "bold sans-serif, black on white bubble with solid border",
      emphasis: "LARGE CAPS, jagged spiky bubble border, slight red tint or glow",
      internal: "italic thought, cloud bubble, smaller quieter presence"
    },

    pacing: "staccato rhythm - rapid small panels during action, large panel for impact climax"
  },

  [Genre.ROMANCE]: {
    visualSignature: [
      "soft diffused lighting with natural lens flare",
      "flower petals, sparkles, or bubbles as romantic overlay",
      "warm color temperature throughout",
      "intimate framing emphasizing expressions and micro-reactions",
      "meaningful negative space showing emotional distance or closeness"
    ],

    cameraWork: {
      establishing: "scenic wide shot setting romantic mood - sunset, rain, cherry blossoms, city lights",
      buildup: [
        "extreme close-up on eyes - the windows to the soul",
        "over-shoulder shot - one character watching another",
        "two-shot with meaningful distance between characters"
      ],
      climax: [
        "tight close-up on hands almost touching or holding",
        "profile shots with shallow depth of field, bokeh background",
        "low angle looking up at confession or emotional peak moment"
      ],
      aftermath: "wide shot - characters together in scene, emotional resolution"
    },

    colorPalette: {
      base: "soft pastels, warm undertones (pink, peach, cream, soft coral)",
      accent: "golden hour warm tones (orange, amber)",
      mood: "desaturated cool tones for sad moments (blue-grey, muted lavender)"
    },

    effects: [
      "sparkle_overlay: soft bokeh light spots, dreamy gaussian glow",
      "flower_petals: floating cherry blossoms, gentle drift, translucent pink",
      "blush_effect: soft pink gradient on cheeks, nose, ears"
    ],

    dialogueStyle: {
      normal: "rounded soft font, light grey text, oval smooth bubble",
      emphasis: "handwritten style font, wavy bubble border, heart accents",
      internal: "italic serif, translucent cloud bubble, smaller introspective"
    },

    pacing: "legato rhythm - flowing connected panels, let emotional moments breathe with white space"
  },

  [Genre.HORROR]: {
    visualSignature: [
      "high contrast chiaroscuro lighting - deep blacks, harsh whites",
      "unsettling asymmetrical compositions, off-balance framing",
      "limited desaturated color palette with single red accent",
      "negative space hiding threats, implying presence",
      "detailed grotesque textures when horror is revealed"
    ],

    cameraWork: {
      establishing: "deceptively normal establishing shot - calm before storm",
      buildup: [
        "slow zoom-in creating claustrophobia",
        "over-shoulder implying unseen presence behind character",
        "extreme wide with tiny figure - vulnerability and isolation"
      ],
      climax: [
        "partial reveal in shadow - imagination fills the gaps",
        "reflection showing what character cannot see",
        "extreme close-up on terrified eyes, detail on fear"
      ],
      aftermath: "silence panel - aftermath of horror, desolation"
    },

    colorPalette: {
      base: "desaturated cold tones (blue-grey, sickly green, pale)",
      accent: "high saturation red - blood, danger - only color that pops",
      mood: "unnatural purple/magenta glow for supernatural elements"
    },

    effects: [
      "shadow_tendrils: wispy black smoke-like shadows, organic reaching shapes",
      "distortion: subtle warping of background, wrong perspective",
      "chromatic_aberration: color fringing on disturbing elements"
    ],

    dialogueStyle: {
      normal: "slightly uneven font, off-white aged bubble",
      emphasis: "distorted jagged text, black bubble with white text, dripping",
      internal: "tiny barely readable text, no bubble, lost in panel"
    },

    pacing: "irregular rhythm - normal pacing suddenly broken by jarring reveals"
  },

  [Genre.FANTASY]: {
    visualSignature: [
      "epic scale establishing shots showing vast worlds",
      "magical particle effects - glowing, swirling energy",
      "intricate costume, armor, and creature design details",
      "rich saturated fantasy color palette",
      "sense of wonder and otherworldly beauty"
    ],

    cameraWork: {
      establishing: "sweeping panoramic vista - kingdoms, forests, mountains",
      buildup: [
        "low angle on towering architecture or creatures",
        "medium shot showing character amidst magical environment",
        "detail shot on magical artifacts or runes"
      ],
      climax: [
        "dynamic spiral around spell casting",
        "wide shot showing scale of magical battle",
        "close-up on glowing magical focal point"
      ],
      aftermath: "establishing shot of transformed landscape or resolved conflict"
    },

    colorPalette: {
      base: "rich jewel tones (emerald, sapphire, ruby, amethyst)",
      accent: "ethereal glow colors (cyan magic, gold divine, purple arcane)",
      mood: "deep midnight blue with colored magical highlights"
    },

    effects: [
      "magic_particles: floating luminescent motes, swirling energy",
      "spell_circle: intricate geometric patterns, glowing runes",
      "elemental_effect: fire/ice/lightning visualization"
    ],

    dialogueStyle: {
      normal: "elegant serif font, ornate bubble borders",
      emphasis: "arcane styled text, magical glow effect",
      internal: "ancient script style, mystical appearance"
    },

    pacing: "epic rhythm - building scale, allowing grandeur moments to land"
  },

  [Genre.SLICE_OF_LIFE]: {
    visualSignature: [
      "naturalistic soft lighting, everyday environments",
      "detailed background art showing lived-in spaces",
      "subtle expression work - micro-expressions matter",
      "warm nostalgic color grading",
      "simple clean compositions focusing on character moments"
    ],

    cameraWork: {
      establishing: "cozy interior or familiar neighborhood exterior",
      buildup: [
        "standard shot-reverse-shot for conversation",
        "group shot around table, couch, familiar gathering spot",
        "observational wide showing daily activities"
      ],
      climax: [
        "close-up on hands doing mundane task (cooking, crafting)",
        "window shot with character in peaceful silhouette",
        "detail shot on meaningful everyday object"
      ],
      aftermath: "warm establishing shot - life continuing, contentment"
    },

    colorPalette: {
      base: "warm earth tones, natural everyday colors",
      accent: "golden afternoon light, soft morning blue",
      mood: "cozy indoor lighting, lamp-lit orange warmth"
    },

    effects: [
      "warm_glow: soft ambient light, comfortable atmosphere",
      "steam_effect: rising steam from food or drinks",
      "seasonal_particles: falling leaves, snow, rain on window"
    ],

    dialogueStyle: {
      normal: "clean readable font, simple round bubbles",
      emphasis: "slightly larger, casual handwritten style",
      internal: "elegant caption boxes, memoir narration style"
    },

    pacing: "steady comfortable rhythm - no rush, savor the moment"
  },

  [Genre.NOIR]: {
    visualSignature: [
      "stark black and white contrast with selective color",
      "venetian blind shadow patterns across faces",
      "rain-slicked urban environments at night",
      "cigarette smoke atmospheric haze",
      "low-key lighting with single harsh source"
    ],

    cameraWork: {
      establishing: "rain-soaked city street, neon signs reflecting on wet pavement",
      buildup: [
        "over-shoulder examining clues or documents",
        "dutch angle for moral ambiguity",
        "silhouette in doorway - mysterious figure"
      ],
      climax: [
        "face half in shadow half in harsh light",
        "gun barrel POV or confrontation",
        "extreme close-up on revealing detail"
      ],
      aftermath: "solitary figure in rain, city continuing around them"
    },

    colorPalette: {
      base: "monochromatic black white grey with high contrast",
      accent: "neon signs (red, blue, yellow) as only color",
      mood: "blue for melancholy, amber for warmth in darkness"
    },

    effects: [
      "rain_effect: streaking rain, wet reflections",
      "smoke_haze: atmospheric cigarette smoke, fog",
      "neon_glow: colored neon reflection on wet surfaces"
    ],

    dialogueStyle: {
      normal: "typewriter font, rectangular hard-edged bubbles",
      emphasis: "bold caps, dark bubble with edge",
      internal: "first-person noir monologue, italicized narration boxes"
    },

    pacing: "slow burn - building atmosphere, dread, revelation"
  },

  [Genre.POLITICS]: {
    visualSignature: [
      "formal symmetrical compositions - power structures",
      "chess-board visual metaphors",
      "suit and boardroom aesthetics",
      "symbolic imagery (scales, masks, puppets, strings)",
      "cold clinical lighting in power spaces"
    ],

    cameraWork: {
      establishing: "imposing government building, corporate tower, assembly hall",
      buildup: [
        "low angle on those in power - dominance",
        "high angle on subordinates - submission",
        "level shot for tense negotiations between equals"
      ],
      climax: [
        "split screen showing public vs private face",
        "reflection revealing true expression behind mask",
        "document close-up revealing conspiracy"
      ],
      aftermath: "chess piece as metaphor - game continues"
    },

    colorPalette: {
      base: "desaturated professional (grey, navy, black, white)",
      accent: "gold accents for wealth and status",
      mood: "sickly green for corruption, harsh white for exposure"
    },

    effects: [
      "shadow_play: dramatic shadows implying hidden truth",
      "reflection: showing true face behind public mask",
      "document_detail: papers, seals, evidence"
    ],

    dialogueStyle: {
      normal: "formal serif font, clean professional bubbles",
      emphasis: "bold weighted words within speech",
      internal: "calculated thought, chess move reasoning"
    },

    pacing: "measured deliberate - every word and frame calculated"
  }
};

// Build genre directing prompt for panel generation
export function buildGenrePrompt(genre: Genre): string {
  const config = GENRE_DIRECTING[genre];

  return `[GENRE DIRECTION - ${genre.toUpperCase()}]

VISUAL SIGNATURE:
${config.visualSignature.map(s => `- ${s}`).join('\n')}

CAMERA WORK GUIDE:
- Establishing: ${config.cameraWork.establishing}
- Build-up shots: ${config.cameraWork.buildup.join(', ')}
- Climax shots: ${config.cameraWork.climax.join(', ')}
- Aftermath: ${config.cameraWork.aftermath}

COLOR PALETTE:
- Base: ${config.colorPalette.base}
- Accent: ${config.colorPalette.accent}
- Mood: ${config.colorPalette.mood}

PACING: ${config.pacing}`;
}
