import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { WebtoonProject } from '../types';
import { GENRE_LABELS } from '../constants';

interface WebtoonViewerProps {
  project: WebtoonProject;
  onEdit: () => void;
}

export const WebtoonViewer: React.FC<WebtoonViewerProps> = ({ project, onEdit }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const panelsRef = useRef<HTMLDivElement>(null);

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
        <div className="flex flex-col">
          {project.panels.map((p, i) => (
            <div key={p.id} className="relative group">
              {p.generatedImageUrl ? (
                <img
                  src={p.generatedImageUrl}
                  className="w-full h-auto block"
                  alt={`Panel ${i+1}`}
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-warm-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-ink-300 uppercase tracking-widest">Panel {i+1} Rendering...</span>
                </div>
              )}

              {/* Advanced Overlay System */}
              <div className="absolute inset-0 flex flex-col pointer-events-none">
                {/* Narrations always at corners */}
                {p.caption && (
                  <div className="m-6 p-5 bg-ink-900 text-white text-sm font-serif leading-relaxed shadow-toon max-w-[80%] self-start border-2 border-ink-700">
                    {p.caption}
                  </div>
                )}

                {/* Speech Bubbles centered or shifted */}
                {p.dialogue && (
                  <div className={`mt-auto mb-12 mx-8 p-5 bg-white border-4 border-ink-900 rounded-[40px] shadow-toon max-w-[75%]
                    ${i % 2 === 0 ? 'self-end rounded-br-none' : 'self-start rounded-bl-none'}
                  `}>
                    <p className="text-ink-900 text-lg font-black tracking-tight leading-snug text-center">
                      {p.dialogue}
                    </p>
                    <div className={`absolute bottom-[-15px] w-6 h-6 bg-white border-b-4 border-r-4 border-ink-900 transform
                      ${i % 2 === 0 ? 'right-4 rotate-45' : 'left-4 rotate-[135deg]'}
                    `}></div>
                  </div>
                )}
              </div>

              {/* Cinematic Gutter */}
              <div className="h-3 bg-warm-50"></div>
            </div>
          ))}
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