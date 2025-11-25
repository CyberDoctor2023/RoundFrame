
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { AppSettings } from './types';
import { DEFAULT_SETTINGS, TRANSPARENT_PRESET } from './constants';
import { analyzeImageForStyle } from './services/geminiService';
import SettingsModal from './components/SettingsModal';
import { translations, Language } from './i18n';

// Utility: RGB to HSL
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

// Utility: HSL to Hex
function hslToHex(h: number, s: number, l: number) {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  const toHex = (x: number) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert to "Smart Background" (Aesthetic, balanced saturation, Dark/Light mode aware)
const toMorandi = (r: number, g: number, b: number): string => {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Smart Logic:
  // 1. Saturation: Boosted for visibility.
  //    Range: 0.4 - 0.9
  let newS = s;
  if (newS < 0.4) newS = 0.4;
  if (newS > 0.9) newS = 0.9;

  // 2. Lightness: Adaptive but allows deeper colors.
  //    Range: 0.6 - 0.95
  let newL;
  if (l < 0.4) {
    // Dark Mode: Map 0-0.4 to 0.2-0.5 (Not too dark, visible color)
    newL = 0.2 + (l * 0.75);
  } else {
    // Light Mode: Map 0.4-1.0 to 0.7-0.95
    newL = 0.7 + ((l - 0.4) / 0.6) * 0.25;
  }

  return hslToHex(h, newS, newL);
};

const normalizeHex = (hex: string): string => {
  if (!hex) return '#000000';
  if (hex.startsWith('#') && hex.length === 4) {
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (!hex.startsWith('#')) return `#${hex}`;
  return hex;
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (value: number) => {
    const hex = value.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixHex = (colorA: string, colorB: string, ratio: number) => {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const mix = (vA: number, vB: number) => Math.round(vA + (vB - vA) * ratio);
  return rgbToHex(mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b));
};

const getImageColors = (imageSrc: string): Promise<{ dominant: string, palette: string[], gradient: { top: string, bottom: string } }> => {
  return new Promise((resolve) => {
    const img = new Image();
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      img.crossOrigin = "Anonymous";
    }
    img.src = imageSrc;

    const fallbackGradient = { top: '#e6e8ec', bottom: '#c6cad4' };
    const fallbackPalette = [
      fallbackGradient.top,
      mixHex(fallbackGradient.top, fallbackGradient.bottom, 0.25),
      mixHex(fallbackGradient.top, fallbackGradient.bottom, 0.5),
      mixHex(fallbackGradient.top, fallbackGradient.bottom, 0.75),
      fallbackGradient.bottom,
    ];
    const fallback = { dominant: '#4b5563', palette: fallbackPalette, gradient: fallbackGradient };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(fallback); return; }

      // 超像素分割：将图片缩小到低分辨率网格
      // 这样每个"超像素"代表原图的一个区域
      const gridSize = 5; // 5x5 网格，共 25 个超像素
      canvas.width = gridSize;
      canvas.height = gridSize;

      // 绘制缩小后的图片（浏览器会自动做平均采样）
      ctx.drawImage(img, 0, 0, gridSize, gridSize);

      try {
        const imageData = ctx.getImageData(0, 0, gridSize, gridSize).data;
        const superpixels: string[] = [];

        // 提取每个超像素的颜色
        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue; // 跳过透明像素

          superpixels.push(rgbToHex(r, g, b));
        }

        if (superpixels.length === 0) {
          resolve(fallback);
          return;
        }

        // 提取关键颜色用于 Aurora 背景
        // 使用网格的特定位置来获取代表性颜色
        const getPixelAt = (x: number, y: number): string => {
          const index = (y * gridSize + x) * 4;
          if (index >= imageData.length) return superpixels[0];
          const r = imageData[index];
          const g = imageData[index + 1];
          const b = imageData[index + 2];
          return rgbToHex(r, g, b);
        };

        // 提取 9 个关键位置的颜色（3x3 网格）
        const keyColors = [
          getPixelAt(0, 0),           // 左上
          getPixelAt(2, 0),           // 中上
          getPixelAt(4, 0),           // 右上
          getPixelAt(0, 2),           // 左中
          getPixelAt(2, 2),           // 中心
          getPixelAt(4, 2),           // 右中
          getPixelAt(0, 4),           // 左下
          getPixelAt(2, 4),           // 中下
          getPixelAt(4, 4),           // 右下
        ];

        // 计算上半部分和下半部分的平均颜色
        const topColors = [
          getPixelAt(0, 0), getPixelAt(1, 0), getPixelAt(2, 0), getPixelAt(3, 0), getPixelAt(4, 0),
          getPixelAt(0, 1), getPixelAt(1, 1), getPixelAt(2, 1), getPixelAt(3, 1), getPixelAt(4, 1),
        ];
        const bottomColors = [
          getPixelAt(0, 3), getPixelAt(1, 3), getPixelAt(2, 3), getPixelAt(3, 3), getPixelAt(4, 3),
          getPixelAt(0, 4), getPixelAt(1, 4), getPixelAt(2, 4), getPixelAt(3, 4), getPixelAt(4, 4),
        ];

        const avgColor = (colors: string[]): string => {
          let r = 0, g = 0, b = 0;
          colors.forEach(color => {
            const rgb = hexToRgb(color);
            r += rgb.r;
            g += rgb.g;
            b += rgb.b;
          });
          return rgbToHex(
            Math.round(r / colors.length),
            Math.round(g / colors.length),
            Math.round(b / colors.length)
          );
        };

        const topColor = avgColor(topColors);
        const bottomColor = avgColor(bottomColors);
        const centerColor = getPixelAt(2, 2);

        // 使用 9 个关键颜色作为调色板（用于 Aurora 的多个模糊球）
        const palette = keyColors;
        const gradient = { top: topColor, bottom: bottomColor };

        resolve({ dominant: centerColor, palette, gradient });
      } catch (e) {
        console.warn("Canvas access failed (likely tainted)", e);
        resolve(fallback);
      }
    };

    img.onerror = () => resolve(fallback);
  });
};

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [auroraGradient, setAuroraGradient] = useState<{ top: string, bottom: string } | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(() =>
    (localStorage.getItem('language') as Language) || 'zh'
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Persist language
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Persist API Key
  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  // Handle Accent Color Updates
  useEffect(() => {
    const root = document.documentElement;
    if (!image) {
      root.style.setProperty('--mac-accent', 'rgba(0, 0, 0, 0.5)');
      setPalette([]);
      setAuroraGradient(null);
    } else {
      getImageColors(image).then(({ dominant, palette, gradient }) => {
        // Set accent to the dominant Morandi color
        root.style.setProperty('--mac-accent', dominant);
        setPalette(palette);
        setAuroraGradient(gradient);
      });
    }
  }, [image]);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) {
      setImage(null);
      return;
    }

    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        setIsProcessingAI(true);

        const heicModule = await import('heic2any');
        const heic2any = (heicModule.default || heicModule) as any;

        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        });

        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImage(e.target.result as string);
            handleUpdateSettings({ panX: 0, panY: 0, scale: 100, ...TRANSPARENT_PRESET });
            setIsProcessingAI(false);
          }
        };
        reader.readAsDataURL(blob);
        return;
      } catch (err: any) {
        console.error("HEIC conversion failed", err);
        setIsProcessingAI(false);
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        handleUpdateSettings({ panX: 0, panY: 0, scale: 100, ...TRANSPARENT_PRESET });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMagicClick = async () => {
    if (!image) return;
    setIsProcessingAI(true);

    try {
      const result = await analyzeImageForStyle(image, apiKey);
      if (result) {
        handleUpdateSettings({
          background: result.background,
          backgroundType: 'ai',
          shadow: result.shadow
        });
      }
    } catch (error) {
      console.error("Failed to get AI suggestion");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleDownload = () => {
    if (exportFn) exportFn();
  };

  const handleReset = () => {
    setSettings({
      ...DEFAULT_SETTINGS,
    });
  }

  const handleSetExportFn = useCallback((fn: () => void) => {
    setExportFn(() => fn);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans text-mac-text animate-fade-in">
      <main className="flex-1 h-full relative overflow-hidden flex flex-col min-w-0 transition-all duration-500 ease-in-out">
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-mac-border flex items-center px-6 justify-between shrink-0 z-10 shadow-sm/50 transition-all">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{translations[language].appName}</span>
          </div>
          <div className="text-xs text-mac-subtext font-medium transition-opacity duration-300">
            {image ? translations[language].editMode : translations[language].noImageSelected}
          </div>
        </header>

        <Canvas
          settings={settings}
          image={image}
          onUpload={handleImageUpload}
          setExportFn={handleSetExportFn}
          updateSettings={handleUpdateSettings}
          isProcessing={isProcessingAI}
          palette={palette}
          auroraGradient={auroraGradient}
        />
      </main>

      <Sidebar
        settings={settings}
        updateSettings={handleUpdateSettings}
        onMagicClick={handleMagicClick}
        isProcessing={isProcessingAI}
        hasImage={!!image}
        onDownload={handleDownload}
        onReset={handleReset}
        palette={palette}
        auroraGradient={auroraGradient}
        apiKey={apiKey}
        setApiKey={setApiKey}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        language={language}
        setLanguage={setLanguage}
        t={translations[language]}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        language={language}
        t={translations[language]}
      />
    </div>
  );
};

export default App;
