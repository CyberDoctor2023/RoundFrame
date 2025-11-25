
import { GradientPreset, AspectRatio } from './types';

export const GRADIENTS: GradientPreset[] = [
  { name: 'Transparent', value: 'transparent', thumbnail: 'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[length:10px_10px] bg-white' },
  { name: 'Desktop', value: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', thumbnail: 'bg-gradient-to-br from-pink-300 to-pink-100' },
  { name: 'Cool', value: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', thumbnail: 'bg-gradient-to-br from-green-300 to-blue-300' },
  { name: 'Nice', value: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', thumbnail: 'bg-gradient-to-br from-purple-200 to-blue-200' },
  { name: 'Morning', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', thumbnail: 'bg-gradient-to-br from-yellow-200 to-orange-300' },
  { name: 'Bright', value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', thumbnail: 'bg-gradient-to-r from-blue-400 to-cyan-300' },
  { name: 'Love', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)', thumbnail: 'bg-gradient-to-t from-teal-400 to-purple-900' },
  { name: 'Rain', value: 'linear-gradient(to top, #5f72bd 0%, #9b23ea 100%)', thumbnail: 'bg-gradient-to-t from-indigo-400 to-purple-600' },
  { name: 'Sky', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', thumbnail: 'bg-gradient-to-br from-indigo-500 to-purple-700' },
  { name: 'Subtle Gray', value: 'linear-gradient(to bottom, #f3f4f6, #d1d5db)', thumbnail: 'bg-gradient-to-b from-gray-100 to-gray-300' },
];

export const WALLPAPERS = [
  "01. Royal Heath.png", "02. Egg Sour.png", "03. Snowy Mint.png", "04. Hopbush.png", "05. Flax.png",
  "06. Wisteria.png", "07. Tidal.png", "08. Violet Blue.png", "09. Light Sky Blue.png", "10. Mindaro.png",
  "100. Chetwode Blue.png", "11. Fuchsia.png", "12. Tumbleweed.png", "13. Pale Violet Red.png", "14. Prim.png",
  "15. Perfume.png", "16. Medium Purple.png", "17. Dark Salmon.png", "18. Buttercup.png", "19. Can Can.png",
  "20. Melanie.png", "21. Columbia Blue.png", "22. Shalimar.png", "23. California.png", "24. Sky Blue.png",
  "25. Witch Haze.png", "26. Honeysuckle.png", "27. Melanie.png", "28. Deco.png", "29. Pale Cornflower Blue.png",
  "30. Wild Rice.png", "31. Portage.png", "32. Banana Mania.png", "33. Beauty Bush.png", "34. Mauve.png",
  "35. Ronchi.png", "36. Pale Chestnut.png", "37. Light Sky Blue.png", "38. Sky Blue.png", "39. Prelude.png",
  "40. Cherokee.png", "41. Tonys Pink.png", "42. Charm.png", "43. Harvest Gold.png", "44. Green Yellow.png",
  "45. Fog.png", "46. Watusi.png", "47. Whisper.png", "48. Witch Haze.png", "49. Soft Peach.png",
  "50. Columbia Blue.png", "51. Spindle.png", "52. Blue Chalk.png", "53. Canary.png", "54. Pink Flare.png",
  "55. My Pink.png", "56. Cream Whisper.png", "57. Light Sky Blue.png", "58. Polution.png", "59. Light Blue.png",
  "60. Zircon.png", "61. Lavender.png", "62. Amour.png", "63. Soft Peach.png", "64. Magic Mint.png",
  "65. Prim.png", "66. Yellow sand.png", "67. Rain.png", "68. Corvette.png", "69. Shocking.png",
  "70. Honeydew.png", "71. Quartz.png", "72. Sazerac.png", "73. Negroni.png", "74. Medium Purple.png",
  "75. Pale Turquoise.png", "76. Rice Flower.png", "77. Green bonbon.png", "78. Night sky.png",
  "79. Heliotrope.png", "80. Dusty blue.png", "81. Kobi.png", "82. Ice cream.png", "83. Frosted Mint.png",
  "84. Lolypop.png", "85. Lily White.png", "86. Cherub.png", "87. Spacy.png", "88. Sunny.png",
  "89. Canvas.png", "90. Grass mint.png", "91. Berry.png", "92. Sunset.png", "93. Medium Goldenrod.png",
  "94. Almond.png", "95. Milkyway.png", "96. Lake.png", "97. Flare.png", "98. Torea Bay.png", "99. Roman.png"
];

export const RATIOS: AspectRatio[] = [
  { label: 'Original', value: 'auto' },
  { label: '1:1', value: '1/1' },
  { label: '4:3', value: '4/3' },
  { label: '16:9', value: '16/9' },
  { label: '9:16', value: '9/16' },
];

export const DEFAULT_SETTINGS = {
  padding: 220,       // ~55% of max padding for spacious default
  inset: 55,          // ~55% border width for presets
  borderRadius: 32,   // Modern, rounder corners (Apple style)
  shadow: 40,         // Soft, professional shadow
  shadowAngle: 135,   // Classic top-left light source
  background: 'transparent',
  aspectRatio: 'auto',
  backgroundType: 'preset' as const,
  scale: 100,
  panX: 0,
  panY: 0,
  meshSeed: 1,
};

// 预设配置 - 方便手动修改
// Preset Configurations - Easy to modify manually

// 纯背景预设（无边框）
// Borderless Preset (Pure Background)
export const BORDERLESS_PRESET = {
  inset: 0,           // 边框宽度：0 = 无边框
  padding: 220,       // 画布边距
  backgroundType: 'mesh' as const,  // 背景类型：mesh = Aurora 渐变
};

// 纯边框预设（透明背景）
// Transparent Preset (Pure Border)
export const TRANSPARENT_PRESET = {
  inset: 55,          // 边框宽度
  background: 'transparent',  // 背景：透明
  backgroundType: 'preset' as const,  // 背景类型
  padding: 220,       // 画布边距
};
