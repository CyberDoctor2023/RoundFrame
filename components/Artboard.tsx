import React, { memo, useMemo } from 'react';
import { AppSettings } from '../types';

// 颜色标准化：确保透明就是透明，白色就是白色
export const normalizeHex = (input: string) => {
    if (!input) return 'transparent';
    const val = input.trim();
    // 显式处理透明关键字
    if (val === 'transparent' || val === 'rgba(0,0,0,0)') return 'transparent';
    if (val.startsWith('url')) return val;

    // 处理简写 Hex (#FFF) -> #FFFFFF
    if (val.startsWith('#') && val.length === 4) {
        const r = val[1], g = val[2], b = val[3];
        return `#${r}${r}${g}${g}${b}${b}`;
    }

    // 补全 # 号
    if (!val.startsWith('#') && !val.startsWith('rgb') && /^[0-9A-Fa-f]{3,8}$/.test(val)) {
        return `#${val}`;
    }
    return val;
};

// 背景组件
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

interface ArtboardProps {
    settings: AppSettings;
    image: string | null;
    base64Image?: string | null; // Allow passing base64 directly
    palette: string[];
    auroraGradient: { top: string, bottom: string } | null;
    layout: {
        exportW: number;
        exportH: number;
        cardW: number;
        cardH: number;
        scale: number;
        shadowExt?: { top: number, bottom: number, left: number, right: number };
    };
    panX?: number;
    panY?: number;
    isPanning?: boolean;
    onMouseDown?: (e: React.MouseEvent) => void;
    className?: string;
    style?: React.CSSProperties;
    // Ref for the image element (optional, for loading checks)
    imgRef?: React.RefObject<HTMLImageElement>;
}

const Artboard = memo(({
    settings,
    image,
    base64Image,
    palette,
    auroraGradient,
    layout,
    panX = 0,
    panY = 0,
    isPanning = false,
    onMouseDown,
    className = "",
    style = {},
    imgRef
}: ArtboardProps) => {

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

    const angleRad = (settings.shadowAngle * Math.PI) / 180;
    const dist = settings.shadow * 0.6;
    const shadowStyle = `${Math.round(Math.cos(angleRad) * dist)}px ${Math.round(Math.sin(angleRad) * dist)}px ${settings.shadow * 1.2}px -${settings.shadow * 0.1}px rgba(0,0,0,${0.15 + settings.shadow / 250})`;

    const currentScale = layout.scale || 1;
    const scaledInset = settings.inset * currentScale;
    const scaledBorderRadius = settings.borderRadius * currentScale;
    const outerR = settings.borderRadius === 0 ? 0 : (scaledBorderRadius + scaledInset);

    return (
        <div
            className={`relative ${className}`}
            style={{
                width: '100%', height: '100%',
                ...backgroundStyle,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s ease-in-out',
                ...style
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
                    transform: `translate(${panX}px, ${panY}px)`,
                    backgroundColor: settings.inset === 0 ? 'transparent' : 'white',
                    borderRadius: `${outerR}px`,
                    boxShadow: shadowStyle,
                    padding: `${scaledInset}px`,
                    boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: onMouseDown ? (isPanning ? 'grabbing' : 'grab') : 'default',
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                }}
                onMouseDown={onMouseDown}
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
                        ref={imgRef}
                        src={base64Image || image || ""}
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
    );
});

export default Artboard;
