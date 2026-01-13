import React, { useState, useRef, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { WebtoonProject, BubbleType } from '../types';
import { GENRE_LABELS } from '../constants';

// ============================================
// 말풍선 스타일 설정
// ============================================

interface BubbleStyleConfig {
  containerClass: string;
  textClass: string;
  tailClass: string;
  animationDelay: number;
}

const BUBBLE_STYLES: Record<BubbleType, BubbleStyleConfig> = {
  speech: {
    containerClass: 'bg-white border-4 border-ink-900 rounded-[40px] shadow-toon',
    textClass: 'text-ink-900 text-lg font-black tracking-tight leading-snug text-center',
    tailClass: 'bg-white border-b-4 border-r-4 border-ink-900',
    animationDelay: 0.3
  },
  shout: {
    containerClass: 'bg-white border-4 border-ink-900 shadow-toon animate-shake',
    textClass: 'text-ink-900 text-xl font-black tracking-tight leading-snug text-center uppercase',
    tailClass: 'bg-white border-b-4 border-r-4 border-ink-900',
    animationDelay: 0.2
  },
  whisper: {
    containerClass: 'bg-warm-100 border-2 border-dashed border-ink-400 rounded-[30px]',
    textClass: 'text-ink-500 text-sm font-medium italic leading-relaxed text-center',
    tailClass: 'bg-warm-100 border-b-2 border-r-2 border-dashed border-ink-400',
    animationDelay: 0.5
  },
  thought: {
    containerClass: 'bg-warm-50 border-2 border-ink-300 rounded-full shadow-sm',
    textClass: 'text-ink-600 text-base italic leading-relaxed text-center',
    tailClass: 'hidden',
    animationDelay: 0.4
  },
  narration: {
    containerClass: 'bg-ink-900 border-2 border-ink-700 rounded-none',
    textClass: 'text-white text-sm font-serif leading-relaxed',
    tailClass: 'hidden',
    animationDelay: 0.1
  },
  sfx: {
    containerClass: 'bg-transparent',
    textClass: 'text-ink-900 text-4xl font-black tracking-tighter transform -rotate-6 drop-shadow-lg',
    tailClass: 'hidden',
    animationDelay: 0
  },
  telepathy: {
    containerClass: 'bg-purple-100 border-2 border-purple-400 rounded-[25px] shadow-lg shadow-purple-200',
    textClass: 'text-purple-800 text-base italic leading-relaxed text-center',
    tailClass: 'hidden',
    animationDelay: 0.4
  },
  radio: {
    containerClass: 'bg-gray-200 border-4 border-double border-gray-500 rounded-sm',
    textClass: 'text-gray-700 text-sm font-mono leading-snug',
    tailClass: 'bg-gray-200 border-b-4 border-r-4 border-double border-gray-500',
    animationDelay: 0.3
  },
  flashback: {
    containerClass: 'bg-amber-50 border-2 border-amber-300 rounded-[30px] opacity-90',
    textClass: 'text-amber-800 text-base italic font-serif leading-relaxed text-center',
    tailClass: 'bg-amber-50 border-b-2 border-r-2 border-amber-300',
    animationDelay: 0.5
  }
};

interface WebtoonViewerProps {
  project: WebtoonProject;
  onEdit: () => void;
}

export const WebtoonViewer: React.FC<WebtoonViewerProps> = ({ project, onEdit }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [visiblePanels, setVisiblePanels] = useState<Set<number>>(new Set());
  const [animatedDialogues, setAnimatedDialogues] = useState<Set<number>>(new Set());
  const panelsRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection Observer로 패널 가시성 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const panelIndex = Number(entry.target.getAttribute('data-panel-index'));
          if (entry.isIntersecting && !isNaN(panelIndex)) {
            // 패널이 보이면 visible 상태로
            setVisiblePanels((prev) => new Set([...prev, panelIndex]));

            // 일정 시간 후 대사 애니메이션 시작
            setTimeout(() => {
              setAnimatedDialogues((prev) => new Set([...prev, panelIndex]));
            }, 400);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    // 각 패널 관찰
    panelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [project.panels.length]);

  // 패널 ref 설정 콜백
  const setPanelRef = useCallback((el: HTMLDivElement | null, index: number) => {
    panelRefs.current[index] = el;
  }, []);

  // Base64 데이터 URL을 Blob으로 변환
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // 개별 패널 ZIP 다운로드
  const downloadPanelsAsZip = async () => {
    setIsExporting(true);
    setExportProgress('ZIP 파일 생성 중...');

    try {
      const zip = new JSZip();
      const folder = zip.folder(project.title || 'webtoon');

      project.panels.forEach((panel, index) => {
        if (panel.generatedImageUrl) {
          const blob = dataURLtoBlob(panel.generatedImageUrl);
          const fileName = `panel_${String(index + 1).padStart(2, '0')}.png`;
          folder?.file(fileName, blob);
        }
      });

      setExportProgress('압축 중...');
      const content = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title || 'webtoon'}_panels.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setExportProgress('완료!');
      setTimeout(() => setExportProgress(''), 2000);
    } catch (err) {
      console.error('ZIP export failed:', err);
      setExportProgress('오류 발생');
    } finally {
      setIsExporting(false);
    }
  };

  // 전체 합본 이미지 생성 및 다운로드
  const downloadMergedImage = async () => {
    setIsExporting(true);
    setExportProgress('합본 이미지 생성 중...');

    try {
      const validPanels = project.panels.filter(p => p.generatedImageUrl);
      if (validPanels.length === 0) {
        setExportProgress('이미지가 없습니다');
        return;
      }

      // 이미지 로드
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      setExportProgress('이미지 로딩 중...');
      const images = await Promise.all(
        validPanels.map(p => loadImage(p.generatedImageUrl!))
      );

      // 캔버스 크기 계산 (모든 이미지 너비 중 최대값, 높이는 합산)
      const maxWidth = Math.max(...images.map(img => img.width));
      const totalHeight = images.reduce((sum, img) => sum + img.height, 0);

      // 캔버스 생성 및 이미지 그리기
      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // 배경색 채우기
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, maxWidth, totalHeight);

      // 이미지를 세로로 연결
      let currentY = 0;
      images.forEach((img) => {
        // 이미지를 중앙 정렬
        const x = (maxWidth - img.width) / 2;
        ctx.drawImage(img, x, currentY);
        currentY += img.height;
      });

      setExportProgress('파일 생성 중...');

      // Blob으로 변환 후 다운로드
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${project.title || 'webtoon'}_full.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');

      setExportProgress('완료!');
      setTimeout(() => setExportProgress(''), 2000);
    } catch (err) {
      console.error('Merged image export failed:', err);
      setExportProgress('오류 발생');
    } finally {
      setIsExporting(false);
    }
  };

  const completedPanels = project.panels.filter(p => p.generatedImageUrl).length;

  return (
    <div className="min-h-screen bg-ink-900 overflow-y-auto selection:bg-toon-500 selection:text-white">
      <nav className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
        <button
          onClick={onEdit}
          className="pointer-events-auto bg-white text-ink-900 px-6 py-3 font-bold text-xs tracking-widest hover:bg-toon-500 hover:text-white transition-colors border-2 border-ink-900 shadow-toon"
        >
          ← EXIT VIEWER
        </button>

        {/* Export Buttons */}
        <div className="pointer-events-auto flex items-center gap-3">
          {exportProgress && (
            <span className="text-xs font-bold text-toon-400 bg-ink-800 px-3 py-2 border border-ink-700">
              {exportProgress}
            </span>
          )}

          <button
            onClick={downloadPanelsAsZip}
            disabled={isExporting || completedPanels === 0}
            className="bg-white text-ink-900 px-5 py-3 font-bold text-xs tracking-widest hover:bg-toon-500 hover:text-white transition-colors border-2 border-ink-900 shadow-toon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ZIP ({completedPanels})
          </button>

          <button
            onClick={downloadMergedImage}
            disabled={isExporting || completedPanels === 0}
            className="bg-toon-600 text-white px-5 py-3 font-bold text-xs tracking-widest hover:bg-toon-700 transition-colors border-2 border-ink-900 shadow-toon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            FULL IMAGE
          </button>
        </div>
      </nav>

      <div className="max-w-[720px] mx-auto bg-warm-50 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-x-4 border-ink-900">
        {/* Cover Section */}
        <header className="pt-40 pb-24 px-12 text-center bg-ink-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {project.panels[0]?.generatedImageUrl && (
              <img src={project.panels[0].generatedImageUrl} className="w-full h-full object-cover blur-2xl" alt="" />
            )}
          </div>
          <div className="relative z-10 space-y-8">
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-toon-400 block">AI Original Series</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter font-serif leading-none italic">{project.title}</h1>
            <div className="flex justify-center items-center gap-6">
              <span className="h-0.5 w-12 bg-ink-700"></span>
              <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">{GENRE_LABELS[project.genre]}</span>
              <span className="h-0.5 w-12 bg-ink-700"></span>
            </div>
            <p className="max-w-md mx-auto text-sm text-ink-400 font-serif leading-relaxed italic">
              "{project.synopsis}"
            </p>
          </div>
        </header>

        {/* Webtoon Panels */}
        <div className="flex flex-col" ref={panelsRef}>
          {project.panels.map((p, i) => {
            const isVisible = visiblePanels.has(i);
            const isDialogueAnimated = animatedDialogues.has(i);

            // 대사 타입 자동 감지
            const detectBubbleType = (text: string): BubbleType => {
              if (!text) return 'speech';
              if (/^[가-힣]{1,4}[!]+$/.test(text.trim()) || /[ㄱ-ㅎ가-힣]{2,6}$/.test(text.trim())) return 'sfx';
              if (text.includes('!') && text.length <= 20 && /[!]{2,}/.test(text)) return 'shout';
              if (text.startsWith('(') && text.endsWith(')')) return 'whisper';
              if (text.startsWith("'") && text.endsWith("'")) return 'thought';
              return 'speech';
            };

            const dialogueBubbleType = p.dialogue ? detectBubbleType(p.dialogue) : 'speech';
            const bubbleStyle = BUBBLE_STYLES[dialogueBubbleType];

            // 레이아웃 기반 여백 계산
            const gutterSize = p.layout?.gutterSize || 'normal';
            const gutterClass = gutterSize === 'tight' ? 'h-1' : gutterSize === 'dramatic' ? 'h-8' : 'h-3';

            return (
              <div
                key={p.id}
                ref={(el) => setPanelRef(el, i)}
                data-panel-index={i}
                className={`relative group transition-all duration-700 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
              >
                {p.generatedImageUrl ? (
                  <img
                    src={p.generatedImageUrl}
                    className={`w-full h-auto block transition-transform duration-500
                      ${isVisible ? 'scale-100' : 'scale-95'}
                    `}
                    alt={`Panel ${i+1}`}
                  />
                ) : (
                  <div className="w-full aspect-[9/16] bg-warm-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-ink-300 uppercase tracking-widest">Panel {i+1} Rendering...</span>
                  </div>
                )}

                {/* Advanced Overlay System with Animation */}
                <div className="absolute inset-0 flex flex-col pointer-events-none">
                  {/* Narrations - top area */}
                  {p.caption && (
                    <div
                      className={`m-6 p-5 max-w-[80%] self-start transition-all duration-500 delay-100
                        ${BUBBLE_STYLES.narration.containerClass}
                        ${isDialogueAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
                      `}
                    >
                      <p className={BUBBLE_STYLES.narration.textClass}>
                        {p.caption}
                      </p>
                    </div>
                  )}

                  {/* Speech Bubbles - dynamic positioning */}
                  {p.dialogue && (
                    <div
                      className={`mt-auto mb-12 mx-8 p-5 max-w-[75%] relative transition-all duration-500
                        ${bubbleStyle.containerClass}
                        ${i % 2 === 0 ? 'self-end' : 'self-start'}
                        ${dialogueBubbleType !== 'sfx' && dialogueBubbleType !== 'thought' ? (i % 2 === 0 ? 'rounded-br-none' : 'rounded-bl-none') : ''}
                        ${isDialogueAnimated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
                      `}
                      style={{
                        transitionDelay: `${bubbleStyle.animationDelay * 1000}ms`
                      }}
                    >
                      <p className={bubbleStyle.textClass}>
                        {p.dialogue}
                      </p>

                      {/* Tail for speech-like bubbles */}
                      {bubbleStyle.tailClass !== 'hidden' && (
                        <div
                          className={`absolute bottom-[-15px] w-6 h-6 transform
                            ${bubbleStyle.tailClass}
                            ${i % 2 === 0 ? 'right-4 rotate-45' : 'left-4 rotate-[135deg]'}
                          `}
                        />
                      )}

                      {/* Thought bubble dots */}
                      {dialogueBubbleType === 'thought' && (
                        <div className={`absolute -bottom-6 ${i % 2 === 0 ? 'right-4' : 'left-4'} flex gap-1`}>
                          <div className="w-3 h-3 bg-warm-50 border border-ink-300 rounded-full" />
                          <div className="w-2 h-2 bg-warm-50 border border-ink-300 rounded-full mt-1" />
                          <div className="w-1.5 h-1.5 bg-warm-50 border border-ink-300 rounded-full mt-2" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multiple dialogue entries support */}
                  {p.dialogueEntries && p.dialogueEntries.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {p.dialogueEntries.map((entry, entryIndex) => {
                        const entryStyle = BUBBLE_STYLES[entry.bubbleStyle.type];
                        return (
                          <div
                            key={entryIndex}
                            className={`absolute p-4 max-w-[70%] transition-all duration-500
                              ${entryStyle.containerClass}
                              ${isDialogueAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
                            `}
                            style={{
                              left: `${entry.bubbleStyle.position.x}%`,
                              top: `${entry.bubbleStyle.position.y}%`,
                              transform: 'translate(-50%, -50%)',
                              transitionDelay: `${(entry.delay || 0) + entryStyle.animationDelay * 1000}ms`
                            }}
                          >
                            <p className={entryStyle.textClass}>
                              {entry.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Dynamic Gutter based on layout */}
                <div className={`${gutterClass} bg-warm-50 transition-all duration-300`} />
              </div>
            );
          })}
        </div>

        {/* Finale */}
        <footer className="py-32 bg-warm-100 border-t-4 border-ink-900 text-center space-y-6">
          <div className="w-12 h-12 bg-ink-900 mx-auto shadow-toon-sm flex items-center justify-center">
            <span className="text-white font-black text-xs">TC</span>
          </div>
          <h4 className="text-sm font-black tracking-[0.5em] uppercase text-ink-900">To Be Continued</h4>
          <p className="text-[10px] text-ink-400 tracking-widest">© 2025 TOONCRAFT STUDIO. ALL RIGHTS RESERVED.</p>
        </footer>
      </div>
    </div>
  );
};