# Changelog

All notable changes to RoundFrame will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-25

### Added
- 🎨 Modern, beautiful UI with smooth animations
- 🖼️ Flexible image framing with adjustable padding, borders, and corner radius
- 🌈 Rich background options:
  - 100+ mesh gradient wallpapers
  - Custom gradients and solid colors
  - Transparent backgrounds
- 🎯 Smart shadow system with interactive angle control
- 📐 Multiple aspect ratio support (1:1, 4:3, 16:9, 9:16, Original)
- 🤖 AI-powered background suggestions using Google Gemini API
- 🌌 Aurora background feature using superpixel segmentation for natural image-extended backgrounds
- 🌍 Full bilingual support (English and Chinese)
- 💾 Complete offline functionality (except AI features)
- 🎭 Drag-and-drop image upload
- 📤 High-quality PNG export with perfect shadow rendering
- 🖱️ Interactive image panning and zooming
- ⌨️ Preset configurations (Borderless, Transparent)
- 🔄 HEIC image format support with automatic conversion

### Technical Highlights
- Built with React 19 and TypeScript
- Desktop application powered by Tauri 1.5
- Modern Tailwind CSS 4 for styling
- Vite 6 for blazing fast builds
- Canvas API for reliable export rendering
- Superpixel segmentation algorithm for Aurora backgrounds

### Security
- No hardcoded API keys
- User-controlled API key storage in localStorage
- Minimal Tauri permissions (principle of least privilege)
- File system access scoped to user directories only

---

## [Unreleased]

### Planned
- Additional export formats (JPEG, WebP)
- Batch processing
- Custom wallpaper upload
- More AI model options
- Advanced shadow effects (multiple shadows, inner shadows)

---

[1.0.0]: https://github.com/CyberDoctor2023/RoundFrame/releases/tag/v1.0.0
