import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

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

const PanelSchema = z.object({
  panelNumber: z.number().int().min(1),
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
    const systemInstruction = `당신은 웹툰 연출 전문가입니다.

[필수 규칙]
1. **Character Visuals**: 주인공의 외모를 "Character Reference Bible" 수준으로 정밀하게 정의하십시오.
   - 얼굴: 눈 모양, 눈 색깔, 코, 입술, 얼굴형
   - 머리: 스타일, 길이, 색상
   - 체형: 키(상대적), 체격
   - 의상: 현재 착용 중인 옷의 색상과 패턴
   - 특징: 흉터, 액세서리 등

2. **Panels**: 컷마다 영화적인 카메라 워크를 사용하십시오.
   - extreme close-up, close-up, medium shot, full shot, wide shot
   - low angle, high angle, dutch angle, bird's eye, worm's eye

3. **Dialogue**: 웹툰 특유의 짧고 임팩트 있는 대사를 한국어로 작성하십시오.

4. **Visual Consistency**: 모든 컷의 description에 캐릭터 외형 키워드를 반복 포함하십시오.`;

    const prompt = `시놉시스: ${synopsis}\n장르: ${genre}\n총 ${count}컷의 상업적 웹툰 콘티를 JSON으로 생성해.`;

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
              characterVisuals: { type: Type.STRING, description: 'Master reference for the main character (English, detailed)' },
              panels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    panelNumber: { type: Type.INTEGER },
                    description: { type: Type.STRING, description: 'Detailed visual prompt for AI image generation (English)' },
                    descriptionKo: { type: Type.STRING, description: '사용자용 연출 가이드 (한국어)' },
                    dialogue: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    characterFocus: { type: Type.STRING },
                    cameraAngle: { type: Type.STRING }
                  },
                  required: ['panelNumber', 'description', 'descriptionKo', 'dialogue', 'caption', 'characterFocus', 'cameraAngle']
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
      includeDialogue = true
    } = req.body;

    if (!panel || !panel.description) {
      const error: ApiError = new Error('패널 정보가 필요합니다.');
      error.statusCode = 400;
      throw error;
    }

    const ai = getAiClient();

    // Build multimodal content parts
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    // 1. Style instruction
    parts.push({
      text: `[MASTERPIECE WEBTOON PANEL - PANEL ${panelIndex + 1}]

STYLE: ${STYLE_PROMPTS[style as ArtStyle] || STYLE_PROMPTS[ArtStyle.WEBTOON_STANDARD]}
ATMOSPHERE: ${GENRE_DESCRIPTIONS[genre as Genre] || GENRE_DESCRIPTIONS[Genre.ACTION]}`
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
      parts.push({ text: '\n[PREVIOUS PANEL - This is the previous scene. Maintain character and background consistency]' });
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
- ${!includeDialogue ? 'DO NOT render any text, letters, numbers, or speech bubbles' : 'Include speech bubbles with the specified text'}
- Maintain perfect facial and clothing consistency
- Vertical composition (3:4 aspect ratio)
- Professional webtoon quality output`
    });

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: '3:4', imageSize: '2K' }
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
