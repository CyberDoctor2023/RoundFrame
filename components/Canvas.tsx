import React, { useRef, useEffect, useState, useMemo, memo } from 'react';
import { AppSettings } from '../types';
import { ImagePlus, Trash2 } from 'lucide-react';
// 引入 Tauri API (必须安装 @tauri-apps/api)
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { save } from '@tauri-apps/api/dialog';
import { exportToCanvas } from '../utils/canvasExport';

interface CanvasProps {
  settings: AppSettings;
  image: string | null;
  onUpload: (file: File) => void;
  setExportFn: (fn: () => void) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  isProcessing: boolean;
  palette: string[];
  auroraGradient: { top: string, bottom: string } | null;
}

// 颜色清洗：确保透明色不被渲染成白色
const normalizeHex = (input: string) => {
  if (!input) return 'transparent';
  const val = input.trim();
  if (val === 'transparent' || val === 'rgba(0,0,0,0)') return 'transparent';
  if (val.startsWith('url')) return val;
  if (val.startsWith('#') && val.length === 4) {
    const r = val[1], g = val[2], b = val[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (!val.startsWith('#') && !val.startsWith('rgb') && /^[0-9A-Fa-f]{3,8}$/.test(val)) {
    return `#${val}`;
  }
  return val;
};

// 背景组件：纯净版（移除了 SVG 噪点防止花屏）
const MeshGradient = memo(({
  palette,
  gradient,
  className = ""
}: {
  palette: string[],
  gradient: { top: string, bottom: string } | null,
  seed?: number,
  className?: string
}) => {
  const fallbackPalette = ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'];
  const colors = palette.length >= 9 ? palette.slice(0, 9) : [...palette, ...fallbackPalette].slice(0, 9);

  const gradientBackground = gradient
    ? `linear-gradient(135deg, ${gradient.top}, ${gradient.bottom})`
    : `linear-gradient(135deg, ${colors[0]}, ${colors[colors.length - 1]})`;

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden bg-white ${className}`}>
      <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: gradientBackground, opacity: 0.95 }} />
      <div className="absolute inset-0 w-full h-full bg-white/10 mix-blend-screen" />
      <div className="absolute inset-0 w-full h-full filter blur-[80px] lg:blur-[140px] opacity-70 scale-110">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply" style={{ backgroundColor: colors[0] }} />
        <div className="absolute top-[-10%] left-[30%] w-[40%] h-[40%] rounded-full mix-blend-multiply" style={{ backgroundColor: colors[1] }} />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply" style={{ backgroundColor: colors[2] }} />
        <div className="absolute top-[30%] left-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply" style={{ backgroundColor: colors[3] }} />
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full mix-blend-multiply" style={{ backgroundColor: colors[4] }} />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply" style={{ backgroundColor: colors[5] }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply" style={{ backgroundColor: colors[6] }} />
        <div className="absolute bottom-[-10%] left-[30%] w-[40%] h-[40%] rounded-full mix-blend-multiply" style={{ backgroundColor: colors[7] }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply" style={{ backgroundColor: colors[8] }} />
      </div>
    </div>
  );
});

const PromptUICard = memo(() => {
  return (
    <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden">
      <div className="absolute -inset-[100%] w-[300%] h-[300%] animate-spin-slow opacity-40"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, #ff9a9e 10%, #fad0c4 25%, #a18cd1 50%, #fbc2eb 75%, transparent 100%)',
          filter: 'blur(80px)'
        }}
      />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(255,255,255,0.9)]" />
    </div>
  );
});

const Canvas: React.FC<CanvasProps> = ({ settings, image, onUpload, setExportFn, updateSettings, isProcessing, palette, auroraGradient }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const dragStart = useRef({ x: 0, y: 0, pX: 0, pY: 0 });

  useEffect(() => {
    if (!image) {
      setImgDimensions({ width: 0, height: 0 });
      return;
    }
    const img = new Image();
    img.src = image;
    let isMounted = true;
    img.onload = () => {
      if (isMounted) setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    return () => { isMounted = false; };
  }, [image]);

  const layout = useMemo(() => {
    if (!image || imgDimensions.width === 0) return { exportW: 0, exportH: 0, cardW: 0, cardH: 0, scale: 1 };
    const { padding, inset, scale, aspectRatio } = settings;
    const natW = imgDimensions.width;
    const natH = imgDimensions.height;
    let exportW = natW, exportH = natH;

    if (aspectRatio !== 'auto') {
      const parts = aspectRatio.split('/');
      const rW = Number(parts[0]), rH = Number(parts[1]);
      const targetRatio = rW / rH;
      if (natW / natH > targetRatio) {
        exportW = natW; exportH = natW / targetRatio;
      } else {
        exportH = natH; exportW = natH * targetRatio;
      }
    }
    const safeW = Math.max(0, exportW - (padding * 2));
    const safeH = Math.max(0, exportH - (padding * 2));
    const baseCardW = natW + (inset * 2);
    const baseCardH = natH + (inset * 2);
    const scaleX = safeW / baseCardW, scaleY = safeH / baseCardH;
    const fitScale = Math.min(scaleX, scaleY);
    const finalScale = fitScale * (scale / 100);
    return { exportW, exportH, cardW: baseCardW * finalScale, cardH: baseCardH * finalScale, scale: finalScale };
  }, [settings, imgDimensions, image]);

  // --- 导出逻辑 (严格顺序：渲染 -> 等待 -> 弹窗) ---
  useEffect(() => {
    setExportFn(async () => {
      if (exportRef.current && image && !isExporting) {
        setIsExporting(true); // 锁定

        const node = exportRef.current;
        const width = layout.exportW;
        // 判断是否为透明/自定义模式，如果是，则允许画布自动扩展以容纳阴影
        const isTransparentMode = settings.background === 'transparent' || settings.backgroundType === 'custom';

        try {
          // 使用 Canvas API 直接渲染，返回 Blob（避免 base64 编解码）
          const blob = await exportToCanvas(
            settings,
            image,
            layout,
            palette,
            auroraGradient
          );

          // 检查渲染结果是否有效
          if (!blob || blob.size === 0) {
            throw new Error("Rendered image data is invalid");
          }

          // 环境检测：Tauri 或浏览器
          const isTauri = '__TAURI__' in window;

          if (isTauri) {
            // Tauri 环境：使用系统对话框
            const filePath = await save({
              defaultPath: 'snapwrap.png',
              filters: [{ name: 'Image', extensions: ['png'] }]
            });

            if (filePath) {
              try {
                // 直接从 Blob 转为 ArrayBuffer，跳过 base64
                const arrayBuffer = await blob.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                await writeBinaryFile(filePath, bytes);
                console.log('Export completed successfully');
              } catch (writeErr) {
                console.error('File write error:', writeErr);
                throw writeErr;
              }
            }
          } else {
            // 浏览器环境：使用 <a> 标签下载
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'snapwrap.png';
            document.body.appendChild(link);
            link.click();
            // 延迟移除，确保下载触发
            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(blobUrl); // 释放内存
            }, 100);
            console.log('Export completed successfully');
          }
        } catch (err) {
          console.error('Export failed:', err);
          const errorMsg = err instanceof Error ? err.message : '未知错误';
          alert(`导出失败：${errorMsg}\n\n请重试或检查磁盘空间`);
        } finally {
          // 确保状态重置，即使发生错误
          setTimeout(() => {
            setIsExporting(false);
            console.log('Export process completed, state reset');
          }, 50);
        }
      }
    });
  }, [image, setExportFn, layout, settings.backgroundType, settings.background]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateSize);
    return () => { observer.disconnect(); window.removeEventListener('resize', updateSize); };
  }, []);

  const viewportScale = useMemo(() => {
    if (containerSize.width === 0 || layout.exportW === 0) return 0.1;
    const FILL = 0.75;
    return Math.min((containerSize.width * FILL) / layout.exportW, (containerSize.height * FILL) / layout.exportH);
  }, [containerSize, layout]);

  const wallpaperSrc = useMemo(() => {
    if (settings.backgroundType !== 'wallpaper') return null;
    const match = settings.background.match(/url\(["']?(.*?)["']?\)/);
    return match ? match[1] : null;
  }, [settings.background, settings.backgroundType]);

  const backgroundStyle = useMemo<React.CSSProperties>(() => {
    if (settings.backgroundType === 'mesh') return { backgroundColor: '#fff' };
    if (settings.backgroundType === 'wallpaper') return { backgroundColor: '#000' };
    return {
      background: `${normalizeHex(settings.background)} center / cover no-repeat`,
    };
  }, [settings.background, settings.backgroundType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onUpload(e.target.files[0]);
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    e.preventDefault(); setIsPanning(true);
    dragStart.current = { x: e.clientX, y: e.clientY, pX: settings.panX, pY: settings.panY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    updateSettings({
      panX: dragStart.current.pX + (e.clientX - dragStart.current.x),
      panY: dragStart.current.pY + (e.clientY - dragStart.current.y)
    });
  };
  const handleMouseUp = () => setIsPanning(false);

  const angleRad = (settings.shadowAngle * Math.PI) / 180;
  const dist = settings.shadow * 0.6;
  const shadowStyle = `${Math.round(Math.cos(angleRad) * dist)}px ${Math.round(Math.sin(angleRad) * dist)}px ${settings.shadow * 1.2}px -${settings.shadow * 0.1}px rgba(0,0,0,${0.15 + settings.shadow / 250})`;

  const currentScale = layout.scale || 1;
  const scaledInset = settings.inset * currentScale;
  const scaledBorderRadius = settings.borderRadius * currentScale;
  const outerR = settings.borderRadius === 0 ? 0 : (scaledBorderRadius + scaledInset);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-100 h-full flex items-center justify-center overflow-hidden relative select-none transition-colors duration-1000 ease-in-out"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
    >
      {isProcessing && !image && <PromptUICard />}

      {!image ? (
        <div
          className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white/80 backdrop-blur-sm shadow-sm hover:scale-[1.02] hover:shadow-lg animate-scale-in ${isDragging ? 'border-mac-accent bg-gray-50 scale-105' : 'border-gray-300 hover:border-mac-accent/50'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files?.[0] && onUpload(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400 transition-colors duration-300 group-hover:text-mac-accent group-hover:bg-gray-100"><ImagePlus size={40} strokeWidth={1.5} /></div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Upload an Image</h3>
          <p className="text-sm text-gray-400">Drag and drop or click to browse</p>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*, .heic" onChange={handleFileSelect} />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center relative animate-fade-in">
          <button
            onClick={() => onUpload(null as any)}
            className="absolute top-6 right-6 z-50 bg-white/80 backdrop-blur text-gray-500 p-3 rounded-full shadow-sm border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:scale-110 hover:shadow-md hover:border-red-200 transition-all duration-300 ease-out"
            title="Remove Image"
          >
            <Trash2 size={20} strokeWidth={1.5} />
          </button>

          <div
            className="relative"
            style={{
              width: layout.exportW * viewportScale,
              height: layout.exportH * viewportScale,
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.2)'
            }}
          >
            {isProcessing && <PromptUICard />}

            <div style={{ width: layout.exportW, height: layout.exportH, transform: `scale(${viewportScale})`, transformOrigin: 'top left' }}>
              <div
                ref={exportRef}
                className="relative"
                style={{
                  width: '100%', height: '100%',
                  ...backgroundStyle,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s ease-in-out'
                }}
              >
                {wallpaperSrc && (
                  <img
                    src={wallpaperSrc}
                    alt="Wallpaper"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {settings.backgroundType === 'mesh' && (
                  <MeshGradient palette={palette} gradient={auroraGradient} seed={settings.meshSeed} />
                )}
                <div
                  className="relative z-30"
                  style={{
                    width: layout.cardW,
                    height: layout.cardH,
                    transform: `translate(${settings.panX}px, ${settings.panY}px)`,
                    backgroundColor: settings.inset === 0 ? 'transparent' : 'white',
                    borderRadius: `${outerR}px`,
                    boxShadow: shadowStyle,
                    padding: `${scaledInset}px`,
                    boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: isPanning ? 'grabbing' : 'grab',
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: `${scaledBorderRadius}px`,
                      overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                      zIndex: 10,
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  >
                    <img
                      src={image}
                      alt="Content"
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;