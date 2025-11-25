import React, { useState, memo } from 'react';

interface WallpaperItemProps {
    src: string;
    isSelected: boolean;
    onClick: () => void;
    name: string;
}

const WallpaperItem = memo(({ src, isSelected, onClick, name }: WallpaperItemProps) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <button
            onClick={onClick}
            className={`w-full aspect-square rounded-md cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-md focus:outline-none relative border border-gray-100 overflow-hidden group ${isSelected ? 'ring-2 ring-mac-accent ring-offset-2 scale-105 shadow-sm' : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-1'
                }`}
            title={name}
        >
            {/* Skeleton Loading State */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                </div>
            )}

            <img
                src={src}
                alt={name}
                loading="lazy"
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </button>
    );
});

WallpaperItem.displayName = 'WallpaperItem';

interface WallpaperGridProps {
    wallpapers: string[];
    currentBackground: string;
    onSelect: (wallpaper: string) => void;
}

const WallpaperGrid = memo(({ wallpapers, currentBackground, onSelect }: WallpaperGridProps) => {
    return (
        <div className="grid grid-cols-4 gap-2">
            {wallpapers.map((w) => (
                <WallpaperItem
                    key={w}
                    src={`/Wallpapers/${w}`}
                    name={w.replace('.png', '')}
                    isSelected={currentBackground.includes(w)}
                    onClick={() => onSelect(w)}
                />
            ))}
        </div>
    );
});

WallpaperGrid.displayName = 'WallpaperGrid';

export default WallpaperGrid;
