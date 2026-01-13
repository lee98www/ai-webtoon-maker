/**
 * 프리셋 이미지 생성 스크립트
 *
 * 이 스크립트는 한 번만 실행하여 스타일/장르 대표 이미지를 생성합니다.
 * 생성된 이미지는 public/previews/ 폴더에 저장됩니다.
 *
 * 실행: npx ts-node scripts/generate-presets.ts
 * 또는: npx tsx scripts/generate-presets.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
enum ArtStyle {
  REALISTIC = 'Realistic Cinematic',
  ANIME = 'Japanese Anime',
  CLAY = 'Claymation / Stop Motion',
  MINHWA = 'Korean Folk Painting (Minhwa)',
  WEBTOON_STANDARD = 'Standard Webtoon / Manhwa',
  SKETCH = 'Black and White Sketch'
}

enum Genre {
  ACTION = 'Action',
  ROMANCE = 'Romance',
  SLICE_OF_LIFE = 'Slice of Life',
  POLITICS = 'Politics',
  NOIR = 'Noir',
  HORROR = 'Horror',
  FANTASY = 'Fantasy'
}

// Style prompts for preview generation
const STYLE_PROMPTS: Record<ArtStyle, string> = {
  [ArtStyle.REALISTIC]: "photorealistic, 8k resolution, cinematic lighting, highly detailed texture, korean blockbuster movie style",
  [ArtStyle.ANIME]: "high quality anime style, cel shaded, vibrant colors, makoto shinkai style, detailed background",
  [ArtStyle.CLAY]: "claymation style, plasticine texture, stop motion look, soft shadows, cute and rounded",
  [ArtStyle.MINHWA]: "korean traditional folk painting style, oriental ink painting, hanji paper texture, flat perspective, elegant colors",
  [ArtStyle.WEBTOON_STANDARD]: "premium webtoon style, manhwa style, clean lines, digital coloring, vertical format optimized, high contrast",
  [ArtStyle.SKETCH]: "rough pencil sketch, charcoal, black and white, artistic strokes, storyboard style"
};

// Genre descriptions for atmosphere
const GENRE_DESCRIPTIONS: Record<Genre, string> = {
  [Genre.ACTION]: "Epic action scene with dynamic movement, martial arts, swords clashing, energy effects",
  [Genre.ROMANCE]: "Romantic atmosphere, cherry blossoms, soft lighting, two silhouettes, warm colors",
  [Genre.SLICE_OF_LIFE]: "Cozy everyday scene, warm sunlight through window, peaceful neighborhood",
  [Genre.POLITICS]: "Dark political thriller atmosphere, shadowy figures, power struggle, corporate building",
  [Genre.NOIR]: "Film noir city night, rain-soaked streets, neon reflections, mysterious figure in trench coat",
  [Genre.HORROR]: "Eerie horror atmosphere, abandoned place, unsettling shadows, creepy fog",
  [Genre.FANTASY]: "Epic fantasy landscape, magical creatures, floating islands, mystical energy"
};

// File naming
const styleToFilename = (style: ArtStyle): string => {
  const map: Record<ArtStyle, string> = {
    [ArtStyle.REALISTIC]: 'realistic-cinematic',
    [ArtStyle.ANIME]: 'japanese-anime',
    [ArtStyle.CLAY]: 'claymation',
    [ArtStyle.MINHWA]: 'korean-minhwa',
    [ArtStyle.WEBTOON_STANDARD]: 'webtoon-standard',
    [ArtStyle.SKETCH]: 'sketch'
  };
  return map[style];
};

const genreToFilename = (genre: Genre): string => {
  const map: Record<Genre, string> = {
    [Genre.ACTION]: 'action',
    [Genre.ROMANCE]: 'romance',
    [Genre.SLICE_OF_LIFE]: 'slice-of-life',
    [Genre.POLITICS]: 'politics',
    [Genre.NOIR]: 'noir',
    [Genre.HORROR]: 'horror',
    [Genre.FANTASY]: 'fantasy'
  };
  return map[genre];
};

async function generateStylePreview(ai: GoogleGenAI, style: ArtStyle): Promise<Buffer> {
  const prompt = `[STYLE DEMONSTRATION IMAGE]

Create a single sample image that perfectly demonstrates this art style:
${STYLE_PROMPTS[style]}

Subject: A young Korean woman with elegant features, portrait style, looking slightly to the side
Background: Simple gradient or style-appropriate artistic background
Purpose: This is a style reference thumbnail for art style selection

IMPORTANT:
- Square 1:1 aspect ratio
- High quality demonstration of the art style characteristics
- Clean, focused composition showcasing the style
- No text, speech bubbles, or watermarks
- Professional quality suitable for a thumbnail`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
      responseModalities: ['image', 'text'],
      // @ts-ignore - imageConfig may not be in types
    }
  });

  // @ts-ignore - accessing image data
  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (part: { inlineData?: { data: string } }) => part.inlineData?.data
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error(`Failed to generate style preview for ${style}`);
  }

  return Buffer.from(imagePart.inlineData.data, 'base64');
}

async function generateGenrePreview(ai: GoogleGenAI, genre: Genre): Promise<Buffer> {
  const prompt = `[GENRE ATMOSPHERE PREVIEW]

Create a mood/atmosphere image that captures the essence of this genre:
Genre: ${genre}
Atmosphere: ${GENRE_DESCRIPTIONS[genre]}
Style: premium webtoon style, manhwa style, clean lines, digital coloring

Purpose: Genre selection thumbnail that conveys the mood and atmosphere

IMPORTANT:
- Wide 16:9 aspect ratio for cinematic feel
- Atmospheric and evocative mood
- No text, no speech bubbles, no watermarks
- Focus on atmosphere, not specific characters
- High quality, professional artwork`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
      responseModalities: ['image', 'text'],
    }
  });

  // @ts-ignore - accessing image data
  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (part: { inlineData?: { data: string } }) => part.inlineData?.data
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error(`Failed to generate genre preview for ${genre}`);
  }

  return Buffer.from(imagePart.inlineData.data, 'base64');
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    console.error('   Usage: GEMINI_API_KEY=your-key npx tsx scripts/generate-presets.ts');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  // Create output directories
  const baseDir = path.join(__dirname, '..', 'public', 'previews');
  const stylesDir = path.join(baseDir, 'styles');
  const genresDir = path.join(baseDir, 'genres');

  fs.mkdirSync(stylesDir, { recursive: true });
  fs.mkdirSync(genresDir, { recursive: true });

  console.log('🎨 ToonCraft AI Studio - Preset Image Generator\n');
  console.log('📁 Output directory:', baseDir);
  console.log('');

  // Generate style previews
  console.log('═══════════════════════════════════════');
  console.log('  Generating Style Previews (6 images)');
  console.log('═══════════════════════════════════════\n');

  const styles = Object.values(ArtStyle);
  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    const filename = `${styleToFilename(style)}.png`;
    const filepath = path.join(stylesDir, filename);

    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  [${i + 1}/${styles.length}] ${style} - already exists, skipping`);
      continue;
    }

    console.log(`🎨 [${i + 1}/${styles.length}] Generating: ${style}...`);

    try {
      const imageBuffer = await generateStylePreview(ai, style);
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`   ✅ Saved: ${filename}`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Rate limiting delay
    if (i < styles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n');

  // Generate genre previews
  console.log('═══════════════════════════════════════');
  console.log('  Generating Genre Previews (7 images)');
  console.log('═══════════════════════════════════════\n');

  const genres = Object.values(Genre);
  for (let i = 0; i < genres.length; i++) {
    const genre = genres[i];
    const filename = `${genreToFilename(genre)}.png`;
    const filepath = path.join(genresDir, filename);

    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  [${i + 1}/${genres.length}] ${genre} - already exists, skipping`);
      continue;
    }

    console.log(`🎭 [${i + 1}/${genres.length}] Generating: ${genre}...`);

    try {
      const imageBuffer = await generateGenrePreview(ai, genre);
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`   ✅ Saved: ${filename}`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Rate limiting delay
    if (i < genres.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════');
  console.log('  Generation Complete!');
  console.log('═══════════════════════════════════════');
  console.log('\n✅ All preset images have been generated.');
  console.log('📁 Location: public/previews/');
  console.log('\nNext steps:');
  console.log('1. Check the generated images in public/previews/');
  console.log('2. Optionally convert to webp for smaller file sizes');
  console.log('3. Update constants.ts with the URL mappings');
}

main().catch(console.error);
