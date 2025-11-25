
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { AppSettings, GradientPreset, AspectRatio } from '../types';
import { GRADIENTS, RATIOS, DEFAULT_SETTINGS, WALLPAPERS, BORDERLESS_PRESET, TRANSPARENT_PRESET } from '../constants';
import ControlSlider from './ControlSlider';
import { Wand2, Download, RotateCcw, Sparkles, Maximize, Grid, ChevronLeft, ChevronRight, Settings, Key } from 'lucide-react';
import WallpaperGrid from './WallpaperGrid';
import SettingsModal from './SettingsModal';
import { Language } from '../i18n';

interface SidebarProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  onMagicClick: () => void;
  isProcessing: boolean;
  hasImage: boolean;
  onDownload: () => void;
  onReset: () => void;
  palette: string[];
  auroraGradient: { top: string, bottom: string } | null;
  apiKey: string;
  setApiKey: (key: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

// Improved Shadow Angle Control
const ShadowAnglePicker = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lightAngle = (value + 180) % 360;

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    onChange(Math.round((angle + 180) % 360));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (isDragging) handleInteraction(e.clientX, e.clientY); };
    const onUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        ref={ref} onMouseDown={onMouseDown}
        className="w-16 h-16 rounded-full border border-mac-border bg-white relative cursor-pointer shadow-inner group active:scale-95 transition-all duration-300 ease-out hover:shadow-md"
        style={{ background: `radial-gradient(circle at 50% 50%, #ffffff 40%, #f5f5f7 100%)` }}
        title="Click or drag to move light source"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-mac-border rounded-full transition-all group-hover:bg-mac-accent" />
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${lightAngle}deg)`, transition: isDragging ? 'none' : 'transform 0.3s ease-out' }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 transition-all">
            <div className="p-3 cursor-grab active:cursor-grabbing">
              <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] ring-2 ring-white group-hover:scale-125 transition-all duration-300 ease-out" />
            </div>
          </div>
        </div>
      </div>
      <div className="text-[10px] text-mac-subtext font-mono">{label}</div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ settings, updateSettings, onMagicClick, isProcessing, hasImage, onDownload, onReset, palette, auroraGradient, apiKey, setApiKey, isSettingsOpen, setIsSettingsOpen, language, setLanguage, t }) => {
  const isAuto = settings.aspectRatio === 'auto';

  // Dynamic gradient for the AI button
  // Always colorful and independent of the image to stand out (Pink/Orange/Blue/Purple)
  const aiButtonGradient = `linear-gradient(135deg, #ff9a9e 0%, #fad0c4 25%, #a18cd1 75%, #fbc2eb 100%)`;

  // Ensure text is dark grey (#4a4a4a) for readability on light Morandi backgrounds
  const buttonTextColor = '#4a4a4a';
  const auroraPreviewGradient = auroraGradient
    ? `linear-gradient(135deg, ${auroraGradient.top}, ${auroraGradient.bottom})`
    : 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 50%, #fad0c4 100%)';

  const handleAuroraClick = () => {
    updateSettings({
      backgroundType: 'mesh',
      // Shuffle the seed to create a new random variation on each click
      meshSeed: settings.meshSeed + 1
    });
  };

  // Pagination for Wallpapers
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(WALLPAPERS.length / ITEMS_PER_PAGE);

  const currentWallpapers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return WALLPAPERS.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage]);

  const nextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const prevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  return (
    <aside className="w-80 bg-gray-50 border-l border-mac-border h-full flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.03)] z-20 overflow-y-auto overflow-x-hidden custom-scrollbar animate-fade-in">
      <div className="p-6 space-y-6">

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-mac-text uppercase tracking-wider">{t.style}</h2>
          <div className="flex items-center gap-2">
            {hasImage && (
              <button onClick={onReset} className="text-mac-subtext hover:text-red-500 transition-all duration-200 flex items-center gap-1 text-xs hover:rotate-180 active:scale-90" title={t.resetToDefaults}>
                <RotateCcw size={12} />
              </button>
            )}
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-mac-border shadow-sm hover:border-mac-accent transition-all duration-200 active:scale-95 text-[10px] font-medium text-mac-text"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              {language === 'zh' ? 'EN' : '中'}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-mac-border shadow-sm hover:border-mac-accent hover:text-mac-accent transition-all duration-200 active:scale-95 ml-auto group"
              title={t.setApiKey}
            >
              <Key size={12} className="text-mac-subtext group-hover:text-mac-accent transition-colors" />
              <span className="text-[10px] font-medium text-mac-text group-hover:text-mac-accent transition-colors">{t.apiKey}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {(() => {
            const isBorderlessSelected = settings.inset === 0;
            const isTransparentSelected = settings.background === 'transparent' && settings.inset > 0;
            const baseButtonClasses = 'flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 group border bg-white text-mac-text';
            const selectedClasses = 'bg-gray-100 border-gray-300 shadow-sm ring-2 ring-gray-300/70 ring-offset-1';
            const idleClasses = 'border-mac-border hover:bg-gray-50 hover:border-mac-accent';

            return (
              <>
                <button
                  onClick={() => updateSettings(BORDERLESS_PRESET)}
                  className={`${baseButtonClasses} ${isBorderlessSelected ? selectedClasses : idleClasses}`}
                  title={t.borderless}
                >
                  <Maximize size={14} className={`transition-colors ${isBorderlessSelected ? 'text-mac-text' : 'text-mac-subtext group-hover:text-mac-accent'}`} />
                  <span>{t.borderless}</span>
                </button>
                <button
                  onClick={() => updateSettings(TRANSPARENT_PRESET)}
                  className={`${baseButtonClasses} ${isTransparentSelected ? selectedClasses : idleClasses}`}
                  title={t.transparent}
                >
                  <Grid size={14} className={`transition-colors ${isTransparentSelected ? 'text-mac-text' : 'text-mac-subtext group-hover:text-mac-accent'}`} />
                  <span>{t.transparent}</span>
                </button>
              </>
            );
          })()}
        </div>

        <div className="space-y-1">
          <ControlSlider label={t.canvasPadding} value={settings.padding} min={0} max={400} onChange={(v) => updateSettings({ padding: v })} />
          <ControlSlider label={t.borderWidth} value={settings.inset} min={0} max={100} onChange={(v) => updateSettings({ inset: v })} />
          <ControlSlider label={t.cornerRadius} value={settings.borderRadius} min={0} max={100} onChange={(v) => updateSettings({ borderRadius: v })} />

          <div className="pt-4 pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-mac-subtext tracking-wide mb-2 block">{t.shadow}</label>
                <ControlSlider label={t.intensity} value={settings.shadow} min={0} max={100} onChange={(v) => updateSettings({ shadow: v })} />
              </div>
              <div>
                <label className="text-xs font-medium text-mac-subtext tracking-wide mb-2 block text-center">{t.light}</label>
                <ShadowAnglePicker value={settings.shadowAngle} onChange={(v) => updateSettings({ shadowAngle: v })} label={t.lightDirection} />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-mac-border" />

        {hasImage && !isAuto && (
          <div className="space-y-1 animate-fade-in">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-mac-subtext uppercase tracking-wide mb-3 block">
                Image Scale
              </label>
            </div>

            <ControlSlider
              label="Zoom"
              value={settings.scale}
              min={10}
              max={300}
              onChange={(v) => updateSettings({ scale: v })}
            />

            <div className="text-[10px] text-mac-subtext text-center mt-1">Drag image to reposition</div>
          </div>
        )}
        {hasImage && !isAuto && <hr className="border-mac-border" />}

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-medium text-mac-subtext uppercase tracking-wide">{t.background}</label>
            {hasImage && (
              <button
                onClick={onMagicClick}
                disabled={isProcessing}
                style={{ backgroundImage: aiButtonGradient, color: '#fff' }}
                className={`group flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all duration-500 ease-out relative overflow-hidden border border-black/5 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ${isProcessing ? 'cursor-wait opacity-90' : ''}`}
              >
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
                <Wand2 size={12} className={`transition-transform duration-700 text-white ${isProcessing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                <span className="text-white drop-shadow-sm">{isProcessing ? t.thinking : t.aiMatch}</span>
                {!isProcessing && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />}
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {/* 1. Aurora / Mesh Button */}
            <button
              onClick={handleAuroraClick}
              className={`col-span-1 relative w-full aspect-square rounded-md cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-md overflow-hidden group ${settings.backgroundType === 'mesh' ? 'ring-2 ring-mac-accent ring-offset-2 scale-105 shadow-sm' : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-1'}`}
              title="Aurora Mesh (Randomize on click)"
            >
              {/* Mini mesh preview */}
              <div className="absolute inset-0 animate-gradient-xy" style={{ background: auroraPreviewGradient }} />
              <div className="absolute inset-0 backdrop-blur-[2px] flex items-center justify-center bg-white/10">
                <Sparkles size={14} className="text-gray-600 drop-shadow-sm" />
              </div>
              <div className="absolute bottom-0 left-0 w-full text-[7px] text-gray-600 font-bold text-center bg-white/30 backdrop-blur-sm py-0.5">
                Aurora
              </div>
            </button>

            {/* 2. Custom Color Input */}
            <div className="relative col-span-1 group">
              <input
                type="color"
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                onChange={(e) => updateSettings({ background: e.target.value, backgroundType: 'custom' })}
              />
              <div className={`w-full aspect-square rounded-md bg-gradient-to-br from-gray-100 to-gray-300 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-[8px] transition-all duration-300 group-hover:bg-gray-50 group-hover:scale-105 group-hover:shadow-sm ${settings.backgroundType === 'custom' ? 'ring-2 ring-mac-accent ring-offset-2 scale-105' : ''}`}>
                Custom
              </div>
            </div>

            {/* 3. Presets */}
            {GRADIENTS.map((g, idx) => (
              <button
                key={idx}
                onClick={() => updateSettings({ background: g.value, backgroundType: 'preset' })}
                className={`w-full aspect-square rounded-md cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-md focus:outline-none relative border border-gray-100 overflow-hidden ${g.thumbnail} ${settings.background === g.value && settings.backgroundType === 'preset' ? 'ring-2 ring-mac-accent ring-offset-2 scale-105 shadow-sm' : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-1'}`}
                title={g.name}
              />
            ))}
          </div>
        </div>


        <hr className="border-mac-border" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-mac-subtext uppercase tracking-wide">{t.wallpapers}</label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-mac-subtext">{currentPage} / {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={12} className="text-mac-text" />
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={12} className="text-mac-text" />
                </button>
              </div>
            </div>
          </div>
          <WallpaperGrid
            wallpapers={currentWallpapers}
            currentBackground={settings.background}
            onSelect={(w) => updateSettings({ background: `url("/Wallpapers/${w}")`, backgroundType: 'wallpaper' })}
          />
          <div className="mt-2 flex justify-center">
            <a
              href="https://www.ls.graphics/products/mesh-gradients"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-mac-subtext/70 hover:text-mac-accent transition-colors flex items-center gap-1"
            >
              <span>{t.meshGradientsBy}</span>
            </a>
          </div>
        </div>

        <hr className="border-mac-border" />

        <div>
          <label className="text-xs font-medium text-mac-subtext uppercase tracking-wide block mb-3">{t.sizeRatio}</label>
          <div className="grid grid-cols-3 gap-2">
            {RATIOS.map((r) => (
              <button
                key={r.label}
                onClick={() => updateSettings({ aspectRatio: r.value, scale: 100, panX: 0, panY: 0 })}
                className={`px-2 py-1.5 text-[10px] font-medium rounded border transition-all duration-200 active:scale-95 backdrop-blur-md ${settings.aspectRatio === r.value ? 'bg-gray-800 text-white border-transparent shadow-md scale-105' : 'bg-white border-mac-border text-mac-text hover:bg-gray-50 hover:border-gray-300'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 mt-auto">
          <button
            onClick={onDownload}
            disabled={!hasImage}
            style={!hasImage ? {} : { backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all duration-300 backdrop-blur-md ${!hasImage ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'text-white shadow-lg hover:shadow-xl hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'}`}
          >
            <Download size={18} className={!hasImage ? '' : 'animate-bounce drop-shadow-sm'} />
            <span className={hasImage ? 'drop-shadow-sm' : ''}>{t.exportImage}</span>
          </button>
        </div>
      </div>


      <div className="p-4 border-t border-mac-border bg-gray-50/50">
        <div className="flex justify-center">
          <span className="text-[9px] text-mac-subtext/40">{t.version}</span>
        </div>
      </div>

    </aside >
  );
};

export default Sidebar;
