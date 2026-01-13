import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { buildStylePrompt, ADVANCED_STYLE_PROMPTS, ArtStyle as StyleEnum } from './prompts/stylePrompts';
import { buildGenrePrompt, GENRE_DIRECTING, Genre as GenreEnum } from './prompts/genreDirecting';
import { buildStoryboardSystemPrompt, EIGHT_PANEL_STRUCTURE, GENRE_TEMPO, DIALOGUE_RULES } from './prompts/storyboardPrompts';

// ============================================
// Types
// ============================================

enum Genre {
  ACTION = 'Action',
  ROMANCE = 'Romance',
  SLICE_OF_LIFE = 'Slice of Life',
  POLITICS = 'Politics',
  NOIR = 'Noir',
  HORROR = 'Horror',
  FANTASY = 'Fantasy'
}

enum ArtStyle {
  REALISTIC = 'Realistic Cinematic',
  ANIME = 'Japanese Anime',
  CLAY = 'Claymation / Stop Motion',
  MINHWA = 'Korean Folk Painting (Minhwa)',
  WEBTOON_STANDARD = 'Standard Webtoon / Manhwa',
  SKETCH = 'Black and White Sketch'
}

interface CharacterRef {
  name: string;
  description: string;
  image: string; // Base64
}

// ============================================
// Constants
// ============================================

const GENRE_DESCRIPTIONS: Record<Genre, string> = {
  [Genre.ACTION]: "타격감 넘치는 액션, 다이내믹한 앵글, 속도감 있는 연출",
  [Genre.ROMANCE]: "감성적인 작화, 인물의 미세한 표정 변화, 설레는 분위기",
  [Genre.SLICE_OF_LIFE]: "편안하고 따뜻한 색감, 공감가는 일상적 묘사",
  [Genre.POLITICS]: "느와르적 긴장감, 무거운 명암 대비, 수트와 실내극",
  [Genre.NOIR]: "차가운 도시의 밤, 강렬한 흑백 대비, 비, 네온 사인",
  [Genre.HORROR]: "기괴한 텍스처, 불안한 구도, 심리적 공포를 자극하는 연출",
  [Genre.FANTASY]: "웅장한 세계관, 마법 효과, 이세계적인 배경과 크리처"
};

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  [ArtStyle.REALISTIC]: "photorealistic, 8k resolution, cinematic lighting, highly detailed texture, korean blockbuster movie style",
  [ArtStyle.ANIME]: "high quality anime style, cel shaded, vibrant colors, makoto shinkai style, detailed background",
  [ArtStyle.CLAY]: "claymation style, plasticine texture, stop motion look, soft shadows, cute and rounded",
  [ArtStyle.MINHWA]: "korean traditional folk painting style, oriental ink painting, hanji paper texture, flat perspective, elegant colors",
  [ArtStyle.WEBTOON_STANDARD]: "premium webtoon style, manhwa style, clean lines, digital coloring, vertical format optimized, high contrast",
  [ArtStyle.SKETCH]: "rough pencil sketch, charcoal, black and white, artistic strokes, storyboard style"
};

// ============================================
// Zod Schemas for Validation
// ============================================

const BeatTypeSchema = z.enum([
  'hook', 'setup', 'development', 'escalation', 'pre_climax', 'climax', 'cliffhanger'
]);

const PanelSchema = z.object({
  panelNumber: z.number().int().min(1),
  beatType: BeatTypeSchema,
  emotionalWeight: z.number().min(0).max(1),
  description: z.string().min(10),
  descriptionKo: z.string().min(5),
  dialogue: z.string(),
  caption: z.string(),
  characterFocus: z.string(),
  cameraAngle: z.string()
});

const StoryboardResponseSchema = z.object({
  title: z.string().min(1),
  characterVisuals: z.string().min(20),
  panels: z.array(PanelSchema).min(4).max(16)
});

// ============================================
// Utility Functions
// ============================================

function safeParseJSON(text: string): unknown {
  let cleaned = text.trim();

  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = cleaned
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/'/g, '"')
      .replace(/\n/g, '\\n');

    return JSON.parse(cleaned);
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, operation: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${operation} 시간 초과 (${ms / 1000}초)`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// Extract base64 data from data URL
function extractBase64(dataUrl: string): string {
  if (dataUrl.startsWith('data:')) {
    return dataUrl.split(',')[1];
  }
  return dataUrl;
}

// Beat-specific directing for 8-panel structure
type BeatType = 'hook' | 'setup' | 'development' | 'escalation' | 'pre_climax' | 'climax' | 'cliffhanger';

function getBeatDirecting(beatType: BeatType | string, emotionalWeight: number, genre: GenreEnum): string {
  const intensityLabel = emotionalWeight >= 0.8 ? 'MAXIMUM INTENSITY' :
                         emotionalWeight >= 0.6 ? 'HIGH INTENSITY' :
                         emotionalWeight >= 0.4 ? 'MODERATE INTENSITY' : 'LOW INTENSITY';

  const beatInstructions: Record<string, string> = {
    'hook': `[STORY BEAT: HOOK - GRAB ATTENTION]
Emotional Intensity: ${intensityLabel} (${(emotionalWeight * 100).toFixed(0)}%)
This is the OPENING panel. It MUST captivate the reader instantly.
REQUIREMENTS:
- Create visual intrigue or mystery
- Use dramatic composition that demands attention
- Consider: silhouette with mystery, dramatic lighting, intriguing close-up
- The reader should think "What's happening here? I need to know more."`,

    'setup': `[STORY BEAT: SETUP - ESTABLISH WORLD]
Emotional Intensity: ${intensityLabel} (${(emotionalWeight * 100).toFixed(0)}%)
This panel establishes the scene and introduces character context.
REQUIREMENTS:
- Clear character introduction in their environment
- Show the "normal world" before conflict
- Use medium or wide shots to establish space
- Reader should understand WHO and WHERE`,

    'development': `[STORY BEAT: DEVELOPMENT - BUILD STORY]
Emotional Intensity: ${intensityLabel} (${(emotionalWeight * 100).toFixed(0)}%)
This panel advances the plot and introduces conflict elements.
REQUIREMENTS:
- Show progression from the previous panel
- Introduce hints of conflict or complication
- Use varied shot composition to maintain interest
- Foreshadow coming tension`,

    'escalation': `[STORY BEAT: ESCALATION - RAISE STAKES]
Emotional Intensity: ${intensityLabel} (${(emotionalWeight * 100).toFixed(0)}%)
Tension is rising rapidly. Things are becoming unavoidable.
REQUIREMENTS:
- Use dutch angles or dynamic camera for unease
- Close-ups on expressions showing stress/determination
- Faster visual rhythm, tighter framing
- The reader's heart rate should increase`,

    'pre_climax': `[STORY BEAT: PRE-CLIMAX - HOLD YOUR BREATH]
Emotional Intensity: ${intensityLabel} (${(emotionalWeight * 100).toFixed(0)}%)
The moment before explosion. Time feels frozen.
REQUIREMENTS:
- Extreme close-up or freeze-frame effect
- Maximum tension in composition
- Minimal or no dialogue - visual silence
- Everything converges to the next panel`,

    'climax': `[STORY BEAT: CLIMAX - MAXIMUM IMPACT]
Emotional Intensity: MAXIMUM (100%)
This is THE moment. The emotional/action peak.
REQUIREMENTS:
- Most impactful composition of the sequence
- Full visual power - dramatic lighting, perfect framing
- Iconic pose or emotional expression
- This panel should be REMEMBERED
- Use the largest visual weight in the scene`,

    'cliffhanger': `[STORY BEAT: CLIFFHANGER - LEAVE THEM WANTING]
Emotional Intensity: ${intensityLabel} (${(emotionalWeight * 100).toFixed(0)}%)
The page-turn hook. Reader MUST want to see what comes next.
REQUIREMENTS:
- Introduce new question or mystery
- Reveal something unexpected OR cut at peak tension
- The reader should think "Wait, what?!"
- Never resolve completely - leave threads open`
  };

  const instruction = beatInstructions[beatType] || beatInstructions['development'];

  // Add genre-specific tempo guidance
  const tempo = GENRE_TEMPO[genre];
  const tempoGuidance = tempo ? `

[GENRE TEMPO: ${genre}]
Rhythm: ${tempo.overallRhythm}
${beatType === 'climax' ? `Climax Style: ${tempo.climaxStyle}` : ''}` : '';

  return instruction + tempoGuidance;
}

// ============================================
// Error Handler
// ============================================

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

function errorHandler(err: ApiError, req: Request, res: Response, _next: NextFunction) {
  console.error('API Error:', err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || '서버 오류가 발생했습니다';
  let code = err.code || 'UNKNOWN_ERROR';

  if (err.message.includes('timeout') || err.message.includes('시간 초과')) {
    statusCode = 408;
    code = 'TIMEOUT';
  } else if (err.message.includes('429') || err.message.includes('rate')) {
    statusCode = 429;
    code = 'RATE_LIMITED';
    message = '요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.';
  } else if (err.message.includes('safety') || err.message.includes('blocked')) {
    statusCode = 422;
    code = 'CONTENT_FILTERED';
    message = '콘텐츠가 안전 필터에 의해 차단되었습니다.';
  } else if (err.message.includes('Invalid') || err.message.includes('validation')) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  res.status(statusCode).json({ error: message, code });
}

// ============================================
// Express App Setup
// ============================================

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000', 'http://127.0.0.1:3000', 'http://127.0.0.1:4000'],
  methods: ['POST', 'GET'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Increased for image data

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: '요청이 너무 빈번합니다. 1분 후 다시 시도해주세요.', code: 'RATE_LIMITED' }
});
app.use('/api', limiter);

// ============================================
// AI Client
// ============================================

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  return new GoogleGenAI({ apiKey });
}

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Refine Synopsis
app.post('/api/refine-synopsis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { input, genre } = req.body;

    if (!input || typeof input !== 'string' || input.trim().length < 5) {
      const error: ApiError = new Error('아이디어를 5자 이상 입력해주세요.');
      error.statusCode = 400;
      throw error;
    }

    const ai = getAiClient();
    const systemInstruction = `당신은 네이버/카카오 웹툰 유료 결제율 1위의 메인 PD입니다.
사용자의 아이디어를 상업적 베스트셀러의 '로그라인'과 '기승전결'로 재구성하십시오.
독자의 도파민을 자극하는 '사이다'와 '반전' 요소를 반드시 포함하고, 상업적인 어휘를 사용하십시오.
출력은 한국어로만, 300자 이내로 간결하게 작성하십시오.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `[장르: ${genre}] 아이디어: "${input}"\n작품의 상업적 가치를 극대화한 시놉시스를 한국어로 작성해.`,
        config: { systemInstruction, temperature: 0.9 }
      }),
      30000,
      '시놉시스 생성'
    );

    const synopsis = response.text?.trim() || '';
    if (!synopsis) {
      throw new Error('시놉시스 생성에 실패했습니다.');
    }

    res.json({ synopsis });
  } catch (err) {
    next(err);
  }
});

// Generate Storyboard
app.post('/api/generate-storyboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { synopsis, genre, count = 8 } = req.body;

    if (!synopsis || typeof synopsis !== 'string' || synopsis.trim().length < 10) {
      const error: ApiError = new Error('시놉시스를 10자 이상 입력해주세요.');
      error.statusCode = 400;
      throw error;
    }

    const ai = getAiClient();

    // 새 프로페셔널 스토리보드 프롬프트 시스템 사용
    const genreKey = genre as GenreEnum;
    const systemInstruction = buildStoryboardSystemPrompt(genreKey);

    // 8컷 구조에 맞는 상세 프롬프트
    const panelStructureGuide = EIGHT_PANEL_STRUCTURE.map(beat =>
      `${beat.position}컷 (${beat.beatType}): ${beat.description.split(' - ')[1] || beat.description}`
    ).join('\n');

    const tempo = GENRE_TEMPO[genreKey];
    const tempoGuide = tempo ? `
[${genre} 템포]
- 빌드업: ${tempo.buildupPace}
- 클라이막스: ${tempo.climaxStyle}
- 리듬: ${tempo.overallRhythm}` : '';

    const prompt = `시놉시스: ${synopsis}

장르: ${genre}
총 ${count}컷의 프로페셔널 웹툰 콘티를 생성하세요.

[8컷 구조 가이드라인 - 반드시 따를 것]
${panelStructureGuide}
${tempoGuide}

[핵심 요구사항]
1. 1컷(훅): 독자를 단번에 사로잡는 강렬한 오프닝
2. 5-6컷(고조): 긴장감이 최고조에 달하는 연출
3. 7컷(클라이막스): 감정의 폭발, 가장 임팩트 있는 장면
4. 8컷(클리프행어): 다음 회차가 궁금하도록 만드는 마무리

각 패널의 description은 영어로, 캐릭터 외형 키워드를 반복 포함하여 일관성 유지.
각 패널의 dialogue는 한국어로, 최대 ${DIALOGUE_RULES.maxLength.speech}자 이내의 임팩트 있는 대사.

JSON 형식으로 응답하세요.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              characterVisuals: { type: Type.STRING, description: 'Master reference for the main character (English, detailed) - include face shape, eye details, hair style/color/length, body type, current outfit with colors, and identifying features' },
              panels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    panelNumber: { type: Type.INTEGER },
                    beatType: {
                      type: Type.STRING,
                      description: 'Story beat type: hook, setup, development, escalation, pre_climax, climax, or cliffhanger'
                    },
                    emotionalWeight: {
                      type: Type.NUMBER,
                      description: 'Emotional intensity from 0.0 to 1.0 (climax should be 1.0)'
                    },
                    description: {
                      type: Type.STRING,
                      description: 'Detailed visual prompt for AI image generation (English). MUST include character appearance keywords for consistency. Include camera angle, lighting, and emotional atmosphere.'
                    },
                    descriptionKo: { type: Type.STRING, description: '사용자용 연출 가이드 (한국어) - 감정, 분위기, 카메라 앵글 설명' },
                    dialogue: { type: Type.STRING, description: '캐릭터 대사 (한국어, 40자 이내). 빈 문자열 가능.' },
                    caption: { type: Type.STRING, description: '나레이션/상황설명 (한국어, 80자 이내). 빈 문자열 가능.' },
                    characterFocus: { type: Type.STRING, description: 'Which character is the focus of this panel' },
                    cameraAngle: { type: Type.STRING, description: 'Camera angle: extreme close-up, close-up, medium shot, full shot, wide shot + low/high/dutch angle etc.' }
                  },
                  required: ['panelNumber', 'beatType', 'emotionalWeight', 'description', 'descriptionKo', 'dialogue', 'caption', 'characterFocus', 'cameraAngle']
                }
              }
            },
            required: ['title', 'characterVisuals', 'panels']
          }
        }
      }),
      60000,
      '콘티 생성'
    );

    const rawText = response.text || '{}';
    let parsed: unknown;
    try {
      parsed = safeParseJSON(rawText);
    } catch (parseErr) {
      console.error('JSON parse error:', rawText.slice(0, 500));
      throw new Error('AI 응답 형식 오류. 다시 시도해주세요.');
    }

    const validation = StoryboardResponseSchema.safeParse(parsed);
    if (!validation.success) {
      console.error('Validation error:', validation.error.issues);
      throw new Error(`응답 검증 실패: ${validation.error.issues[0]?.message || '알 수 없는 오류'}`);
    }

    const data = validation.data;

    const panels = data.panels.map((p, idx) => ({
      ...p,
      id: `panel-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      isGenerating: false
    }));

    res.json({
      title: data.title,
      characterVisuals: data.characterVisuals,
      panels
    });
  } catch (err) {
    next(err);
  }
});

// Generate Panel Image with References and Speech Bubbles
app.post('/api/generate-panel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      panel,
      style,
      genre,
      characterVisuals,
      panelIndex = 0,
      // New reference options
      characterRefs = [],
      styleRef = null,
      previousPanelImage = null,
      includeDialogue = false  // 기본값 false - 말풍선은 프론트엔드 오버레이로 처리
    } = req.body;

    if (!panel || !panel.description) {
      const error: ApiError = new Error('패널 정보가 필요합니다.');
      error.statusCode = 400;
      throw error;
    }

    const ai = getAiClient();

    // Build multimodal content parts
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    // 1. Master header with professional style and genre directing
    const stylePrompt = buildStylePrompt(style as StyleEnum);
    const genrePrompt = buildGenrePrompt(genre as GenreEnum);

    // Beat-specific directing based on 8-panel structure
    const beatType = panel.beatType || 'development';
    const emotionalWeight = panel.emotionalWeight || 0.5;
    const beatDirecting = getBeatDirecting(beatType, emotionalWeight, genre as GenreEnum);

    parts.push({
      text: `[MASTERPIECE WEBTOON PANEL - PANEL ${panelIndex + 1}]

TARGET: Professional Korean webtoon publication quality
FORMAT: 9:16 vertical (mobile short-form optimized)
RESOLUTION: 2K minimum

${stylePrompt}

${genrePrompt}

${beatDirecting}`
    });

    // 2. Style reference image (if provided)
    if (styleRef) {
      parts.push({ text: '\n[STYLE REFERENCE - Follow this art style exactly]' });
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: extractBase64(styleRef)
        }
      });
    }

    // 3. Character references (if provided)
    if (characterRefs && characterRefs.length > 0) {
      parts.push({ text: '\n[CHARACTER REFERENCES - These characters must look exactly like this]' });
      for (const charRef of characterRefs as CharacterRef[]) {
        if (charRef.image) {
          parts.push({
            inlineData: {
              mimeType: 'image/png',
              data: extractBase64(charRef.image)
            }
          });
          parts.push({ text: `Character: ${charRef.name} - ${charRef.description}` });
        }
      }
    }

    // 4. Previous panel for consistency (if provided)
    if (previousPanelImage) {
      parts.push({
        text: `\n[PREVIOUS PANEL REFERENCE]
This is the PREVIOUS scene for REFERENCE ONLY.

USE THIS FOR:
- Character appearance consistency (face, hair, clothing MUST match)
- Location/setting continuity (if same location)
- Color palette and lighting mood

DO NOT:
- Copy the composition or layout
- Use the same camera angle
- Replicate the pose or position
- Duplicate the background arrangement

IMPORTANT: Create a COMPLETELY NEW and DISTINCT composition.
This panel should show the NEXT moment in the story progression.
The scene must advance - different angle, different pose, different framing.`
      });
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: extractBase64(previousPanelImage)
        }
      });
    }

    // 5. Character text description
    parts.push({
      text: `\n[CHARACTER IDENTITY LOCK]
CRITICAL: Characters must look EXACTLY the same across all panels.
${characterVisuals || 'Generic protagonist'}`
    });

    // 6. Scene description
    parts.push({
      text: `\n[SCENE COMPOSITION]
${panel.description}

[CAMERA]
Angle: ${panel.cameraAngle || 'medium shot'}
Focus: ${panel.characterFocus || 'main character'}`
    });

    // 7. Speech bubbles (if dialogue/caption exists and includeDialogue is true)
    if (includeDialogue && (panel.dialogue || panel.caption)) {
      let bubbleInstructions = '\n[SPEECH BUBBLES - MUST BE INCLUDED IN THE IMAGE]';

      if (panel.dialogue) {
        bubbleInstructions += `\n- Draw a speech bubble with the text: "${panel.dialogue}"
  - Position: near the speaking character's head
  - Style: clean white bubble with black outline, tail pointing to speaker`;
      }

      if (panel.caption) {
        bubbleInstructions += `\n- Draw a narration box with the text: "${panel.caption}"
  - Position: top of panel
  - Style: rectangular box with subtle styling`;
      }

      bubbleInstructions += `\n
SPEECH BUBBLE RULES:
- Use clear, readable Korean text
- Text must be legible and properly sized
- Integrate bubbles naturally into the composition
- DO NOT leave bubbles empty`;

      parts.push({ text: bubbleInstructions });
    }

    // 8. Final rules
    parts.push({
      text: `\n[ABSOLUTE RULES]
- Cinematic lighting, high-end illustration quality
- ${!includeDialogue ? 'DO NOT render any text, letters, numbers, speech bubbles, or captions in the image. Leave clean space for text overlay.' : 'Include speech bubbles with the specified text'}
- Maintain perfect facial and clothing consistency
- Vertical composition optimized for mobile short-form content (9:16 aspect ratio)
- Professional webtoon quality output
- Each panel must have a UNIQUE composition - never copy previous panel layout`
    });

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: '9:16', imageSize: '2K' }  // 숏폼 최적화 비율
        }
      }),
      180000, // 3 minute timeout for complex image generation
      '이미지 생성'
    );

    const imageData = response.candidates?.[0]?.content?.parts.find(
      (p: any) => p.inlineData
    )?.inlineData?.data;

    if (!imageData) {
      throw new Error('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    }

    res.json({ imageUrl: `data:image/png;base64,${imageData}` });
  } catch (err) {
    next(err);
  }
});

// Generate Character Sheet (AI 캐릭터 시트 생성)
app.post('/api/generate-character-sheet', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      artStyle = ArtStyle.WEBTOON_STANDARD,
      gender = 'unspecified'
    } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      const error: ApiError = new Error('캐릭터 설명을 5자 이상 입력해주세요.');
      error.statusCode = 400;
      throw error;
    }

    const ai = getAiClient();

    const prompt = `[CHARACTER REFERENCE SHEET GENERATION]

Create a professional character reference sheet for webtoon/animation production.

CHARACTER SPECIFICATIONS:
- Name: ${name || 'Unnamed Character'}
- Description: ${description}
- Gender: ${gender}

GENERATE A SINGLE IMAGE containing:
1. FRONT VIEW (3/4 body, neutral standing pose) - LEFT SIDE
2. FACE CLOSE-UP (showing detailed facial features) - CENTER TOP
3. 3/4 ANGLE VIEW (upper body, slight turn) - CENTER BOTTOM
4. EXPRESSION VARIATIONS (3 small faces: smile, angry, surprised) - RIGHT SIDE

STYLE: ${STYLE_PROMPTS[artStyle as ArtStyle] || STYLE_PROMPTS[ArtStyle.WEBTOON_STANDARD]}

CRITICAL REQUIREMENTS:
- All views must show the EXACT SAME character with consistent features
- Clean white/light gray background
- Professional turnaround sheet layout
- NO text labels on the image
- High detail on face, hair, and clothing
- Consistent proportions across all views
- This reference sheet will be used for consistency in webtoon production`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: prompt,
        config: {
          imageConfig: { aspectRatio: '1:1', imageSize: '2K' }
        }
      }),
      180000,
      '캐릭터 시트 생성'
    );

    const imageData = response.candidates?.[0]?.content?.parts.find(
      (p: any) => p.inlineData
    )?.inlineData?.data;

    if (!imageData) {
      throw new Error('캐릭터 시트 생성에 실패했습니다. 다시 시도해주세요.');
    }

    // AI로 캐릭터 특징 추출
    const featureResponse = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { text: `Based on this character description, extract precise visual features for consistency in webtoon production.

Character Description: ${description}

Output a detailed feature list in English:
- Face shape:
- Eyes (shape, color, distinctive features):
- Hair (style, length, color, bangs):
- Nose and lips:
- Skin tone:
- Body type:
- Distinctive marks (scars, moles, accessories):
- Clothing description:

Be EXTREMELY specific and detailed. These features must be reproducible across multiple panels.` }
        ],
        config: { temperature: 0.3 }
      }),
      30000,
      '특징 추출'
    );

    const extractedFeatures = featureResponse.text?.trim() || '';

    res.json({
      imageUrl: `data:image/png;base64,${imageData}`,
      extractedFeatures,
      name: name || 'Unnamed Character'
    });
  } catch (err) {
    next(err);
  }
});

// Generate Style Reference (AI 스타일 레퍼런스 생성)
app.post('/api/generate-style-reference', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      keywords = [],
      baseStyle = ArtStyle.WEBTOON_STANDARD,
      sampleScene = '도시 배경의 캐릭터'
    } = req.body;

    if (!keywords || keywords.length === 0) {
      const error: ApiError = new Error('스타일 키워드를 1개 이상 선택해주세요.');
      error.statusCode = 400;
      throw error;
    }

    const ai = getAiClient();

    // 키워드를 영어로 매핑
    const keywordMap: Record<string, string> = {
      '선명한 선화': 'crisp clean line art with bold outlines',
      '수채화 느낌': 'watercolor texture with soft color bleeding',
      '그라데이션': 'smooth gradient shading and color transitions',
      '플랫 컬러': 'flat solid colors with minimal shading',
      '강한 명암': 'high contrast dramatic lighting and shadows',
      '파스텔 톤': 'soft pastel color palette',
      '네온 컬러': 'vibrant neon colors with glow effects',
      '빈티지': 'vintage retro aesthetic with muted tones',
      '미니멀': 'minimalist clean design with simple shapes',
      '디테일함': 'highly detailed intricate artwork'
    };

    const englishKeywords = keywords.map((k: string) => keywordMap[k] || k).join(', ');

    const prompt = `[STYLE REFERENCE SAMPLE GENERATION]

Create a style reference image for webtoon production.

BASE STYLE: ${STYLE_PROMPTS[baseStyle as ArtStyle] || STYLE_PROMPTS[ArtStyle.WEBTOON_STANDARD]}

ADDITIONAL STYLE ATTRIBUTES:
${englishKeywords}

SCENE TO ILLUSTRATE: ${sampleScene}

REQUIREMENTS:
- This image will serve as a STYLE REFERENCE for consistent art production
- Demonstrate the specific visual style clearly
- Focus on: line quality, color palette, shading technique, texture
- Professional webtoon illustration quality
- Vertical format optimized for mobile (9:16)`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: prompt,
        config: {
          imageConfig: { aspectRatio: '9:16', imageSize: '2K' }
        }
      }),
      180000,
      '스타일 레퍼런스 생성'
    );

    const imageData = response.candidates?.[0]?.content?.parts.find(
      (p: any) => p.inlineData
    )?.inlineData?.data;

    if (!imageData) {
      throw new Error('스타일 레퍼런스 생성에 실패했습니다. 다시 시도해주세요.');
    }

    // 스타일 설명 생성
    const extractedStyle = `Style: ${baseStyle}\nKeywords: ${keywords.join(', ')}\nScene: ${sampleScene}`;

    res.json({
      imageUrl: `data:image/png;base64,${imageData}`,
      extractedStyle,
      keywords
    });
  } catch (err) {
    next(err);
  }
});

// Error handler middleware (must be last)
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   ToonCraft API Server v2.0                              ║
║   Running on http://localhost:${PORT}                       ║
║                                                          ║
║   Features:                                              ║
║   - Character reference image support                    ║
║   - Style reference image support                        ║
║   - Previous panel consistency                           ║
║   - AI speech bubble generation                          ║
╚══════════════════════════════════════════════════════════╝
  `);

  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  Warning: GEMINI_API_KEY environment variable is not set');
  }
});
