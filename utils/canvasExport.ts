import { AppSettings } from '../types';

interface ExportLayout {
    exportW: number;
    exportH: number;
    cardW: number;
    cardH: number;
    scale: number;
}

interface ShadowMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

/**
 * 计算阴影边距（用于扩展画布）
 */
function calculateShadowMargin(settings: AppSettings): ShadowMargin {
    if (settings.background !== 'transparent') {
        return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const angleRad = (settings.shadowAngle * Math.PI) / 180;
    const dist = settings.shadow * 0.6;
    const blur = settings.shadow * 1.2;
    const spread = -settings.shadow * 0.1;
    const x = Math.cos(angleRad) * dist;
    const y = Math.sin(angleRad) * dist;

    return {
        top: Math.max(0, -y + blur + spread + 20),
        bottom: Math.max(0, y + blur + spread + 20),
        left: Math.max(0, -x + blur + spread + 20),
        right: Math.max(0, x + blur + spread + 20)
    };
}

/**
 * 解析 CSS linear-gradient 字符串并在 Canvas 上绘制
 */
function parseCSSGradient(gradientStr: string, ctx: CanvasRenderingContext2D, width: number, height: number): CanvasGradient | string {
    // 如果不是渐变字符串，直接返回（可能是纯色）
    if (!gradientStr.includes('linear-gradient')) {
        return gradientStr;
    }

    try {
        // 提取方向和颜色
        // 例如: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%)"
        const match = gradientStr.match(/linear-gradient\(([^)]+)\)/);
        if (!match) return gradientStr;

        const parts = match[1].split(',').map(p => p.trim());
        let direction = parts[0];
        let colorStops = parts.slice(1);

        // 如果第一个部分不是方向（没有 deg 或 to），则它是颜色
        if (!direction.includes('deg') && !direction.includes('to ')) {
            colorStops = [direction, ...colorStops];
            direction = '180deg'; // 默认方向
        }

        // 解析方向为角度
        let angle = 180; // 默认从上到下
        if (direction.includes('deg')) {
            angle = parseFloat(direction);
        } else if (direction.includes('to ')) {
            // 转换 CSS 方向关键字为角度
            if (direction.includes('right')) angle = 90;
            else if (direction.includes('left')) angle = 270;
            else if (direction.includes('top')) angle = 0;
            else if (direction.includes('bottom')) angle = 180;
        }

        // 将角度转换为 Canvas 坐标
        // CSS: 0deg = 向上, 90deg = 向右, 180deg = 向下
        // Canvas: 需要计算起点和终点坐标
        const rad = (angle - 90) * Math.PI / 180;
        const x0 = width / 2 - Math.cos(rad) * width / 2;
        const y0 = height / 2 - Math.sin(rad) * height / 2;
        const x1 = width / 2 + Math.cos(rad) * width / 2;
        const y1 = height / 2 + Math.sin(rad) * height / 2;

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        // 解析颜色停止点
        colorStops.forEach(stop => {
            const stopMatch = stop.match(/(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\))\s*(\d+)?\s*%?/);
            if (stopMatch) {
                const color = stopMatch[1];
                const position = stopMatch[2] ? parseFloat(stopMatch[2]) / 100 : undefined;

                if (position !== undefined) {
                    gradient.addColorStop(position, color);
                } else {
                    // 如果没有指定位置，均匀分布
                    const index = colorStops.indexOf(stop);
                    const pos = index / (colorStops.length - 1);
                    gradient.addColorStop(pos, color);
                }
            }
        });

        return gradient;
    } catch (e) {
        console.error('Failed to parse gradient:', gradientStr, e);
        return gradientStr;
    }
}

/**
 * 绘制背景
 */
function drawBackground(
    ctx: CanvasRenderingContext2D,
    settings: AppSettings,
    layout: ExportLayout,
    margin: ShadowMargin,
    palette: string[],
    auroraGradient: { top: string, bottom: string } | null
) {
    const canvasW = layout.exportW + margin.left + margin.right;
    const canvasH = layout.exportH + margin.top + margin.bottom;

    if (settings.background === 'transparent') {
        // 透明背景：不绘制
        return;
    }

    if (settings.backgroundType === 'mesh') {
        // Mesh 渐变背景
        const fallbackPalette = ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'];
        const colors = palette.length >= 9 ? palette.slice(0, 9) : [...palette, ...fallbackPalette].slice(0, 9);

        // 确保所有颜色有效（不是 transparent 或空）
        const validColors = colors.filter(c => c && c !== 'transparent' && !c.startsWith('url'));
        if (validColors.length === 0) {
            // 如果没有有效颜色，使用 fallback
            validColors.push(...fallbackPalette.slice(0, 9));
        }

        // 白色底
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // 渐变层
        const gradient = ctx.createLinearGradient(0, 0, canvasW, canvasH);
        if (auroraGradient) {
            gradient.addColorStop(0, auroraGradient.top);
            gradient.addColorStop(1, auroraGradient.bottom);
        } else {
            gradient.addColorStop(0, validColors[0]);
            gradient.addColorStop(1, validColors[validColors.length - 1]);
        }
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasW, canvasH);
        ctx.globalAlpha = 1;

        // 简化的 mesh 效果（用径向渐变模拟）
        ctx.globalAlpha = 0.3;
        ctx.globalCompositeOperation = 'multiply'; // 使用 multiply 混合模式
        validColors.slice(0, 9).forEach((color, i) => {
            const x = (i % 3) * (canvasW / 2);
            const y = Math.floor(i / 3) * (canvasH / 2);
            const radialGrad = ctx.createRadialGradient(x, y, 0, x, y, canvasW * 0.4);
            radialGrad.addColorStop(0, color);
            radialGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = radialGrad;
            ctx.fillRect(0, 0, canvasW, canvasH);
        });
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over'; // 重置混合模式
    } else if (settings.backgroundType === 'preset' || settings.backgroundType === 'custom') {
        // 纯色或渐变背景
        const fillStyle = parseCSSGradient(settings.background, ctx, canvasW, canvasH);
        ctx.fillStyle = fillStyle;
        ctx.fillRect(0, 0, canvasW, canvasH);
    }
    // wallpaper 在外部处理（需要图片）
}

/**
 * 绘制图片卡片（带阴影）
 */
async function drawImageCard(
    ctx: CanvasRenderingContext2D,
    imageElement: HTMLImageElement,
    settings: AppSettings,
    layout: ExportLayout,
    margin: ShadowMargin
) {
    const centerX = margin.left + layout.exportW / 2;
    const centerY = margin.top + layout.exportH / 2;

    const cardX = centerX - layout.cardW / 2 + settings.panX;
    const cardY = centerY - layout.cardH / 2 + settings.panY;

    const currentScale = layout.scale || 1;
    const scaledInset = settings.inset * currentScale;
    const scaledBorderRadius = settings.borderRadius * currentScale;
    const outerR = settings.borderRadius === 0 ? 0 : (scaledBorderRadius + scaledInset);

    // 绘制阴影
    const angleRad = (settings.shadowAngle * Math.PI) / 180;
    const dist = settings.shadow * 0.6;
    ctx.shadowOffsetX = Math.cos(angleRad) * dist;
    ctx.shadowOffsetY = Math.sin(angleRad) * dist;
    ctx.shadowBlur = settings.shadow * 1.2;
    ctx.shadowColor = `rgba(0,0,0,${0.15 + settings.shadow / 250})`;

    // 绘制卡片背景（白色，带圆角）
    if (settings.inset > 0) {
        ctx.fillStyle = '#ffffff';
        if (outerR > 0) {
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, layout.cardW, layout.cardH, outerR);
            ctx.fill();
        } else {
            ctx.fillRect(cardX, cardY, layout.cardW, layout.cardH);
        }
    }

    // 重置阴影（避免影响图片）
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // 绘制图片（带圆角裁切）
    const imgX = cardX + scaledInset;
    const imgY = cardY + scaledInset;
    const imgW = layout.cardW - scaledInset * 2;
    const imgH = layout.cardH - scaledInset * 2;

    ctx.save();
    if (scaledBorderRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, scaledBorderRadius);
        ctx.clip();
    }
    ctx.drawImage(imageElement, imgX, imgY, imgW, imgH);
    ctx.restore();
}

/**
 * 主导出函数
 */
export async function exportToCanvas(
    settings: AppSettings,
    imageUrl: string,
    layout: ExportLayout,
    palette: string[],
    auroraGradient: { top: string, bottom: string } | null
): Promise<string> {
    // 加载图片
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    await img.decode();

    // 计算画布尺寸
    const margin = calculateShadowMargin(settings);
    const canvasW = layout.exportW + margin.left + margin.right;
    const canvasH = layout.exportH + margin.top + margin.bottom;

    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvasW * 2; // 2x for retina
    canvas.height = canvasH * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);

    // 绘制背景
    drawBackground(ctx, settings, layout, margin, palette, auroraGradient);

    // 如果是壁纸背景，绘制壁纸图片
    if (settings.backgroundType === 'wallpaper') {
        const match = settings.background.match(/url\(["']?(.*?)["']?\)/);
        if (match) {
            const wallpaperImg = new Image();
            wallpaperImg.crossOrigin = 'Anonymous';
            wallpaperImg.src = match[1];
            try {
                await wallpaperImg.decode();
                ctx.drawImage(wallpaperImg, 0, 0, canvasW, canvasH);
            } catch (e) {
                console.warn('Wallpaper load failed', e);
            }
        }
    }

    // 绘制图片卡片（带阴影）
    await drawImageCard(ctx, img, settings, layout, margin);

    return canvas.toDataURL('image/png');
}
