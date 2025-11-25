# RoundFrame / 圆角描边

<div align="center">

[English](#english) | [中文](#中文)

A beautiful, modern image frame editor built with React, Vite, and Tauri.

一个精美的现代化图片边框编辑器，使用 React、Vite 和 Tauri 构建。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![Tauri](https://img.shields.io/badge/Tauri-1.5.0-ffc131.svg)

</div>

---

## English

### ✨ Features

- 🎨 **Beautiful UI** - Modern, clean interface with smooth animations
- 🖼️ **Flexible Framing** - Adjustable padding, borders, and corner radius
- 🌈 **Rich Backgrounds** - Gradients, solid colors, wallpapers, and AI-powered suggestions
- 🎯 **Smart Shadows** - Interactive shadow control with adjustable angle and intensity
- 📐 **Multiple Aspect Ratios** - Support for various output sizes
- 🤖 **AI Integration** - Gemini-powered background color suggestions
- 🌌 **Aurora Background** - Superpixel segmentation for natural, image-extended backgrounds
- 🌍 **Bilingual** - Full support for English and Chinese
- 💾 **Offline Ready** - Works completely offline (except AI features)
- 🎭 **100+ Wallpapers** - Beautiful mesh gradient wallpapers included
- 📤 **Perfect Export** - Canvas API rendering ensures pixel-perfect exports without shadow clipping

### 🚀 Quick Start

#### Prerequisites

- Node.js 16+
- npm or yarn
- Rust (for Tauri builds)

#### Installation

```bash
# Clone the repository
git clone https://github.com/CyberDoctor2023/RoundFrame.git
cd roundframe

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### 🎯 Usage

1. **Upload an Image** - Drag and drop or click to select
2. **Adjust Settings** - Use the sidebar to customize padding, borders, shadows, etc.
3. **Choose Background** - Select from gradients, wallpapers, or use AI suggestions
4. **Export** - Download your beautifully framed image

### 🔑 AI Features (Optional)

To use AI-powered background suggestions:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/)
2. Click the "API Key" button in the sidebar
3. Enter your API key and save
4. Click "AI Match" to get intelligent background suggestions

### 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite 6
- **Desktop**: Tauri 1.5
- **Icons**: Lucide React
- **AI**: Google Gemini API
- **Export**: Canvas API (pixel-perfect rendering)
- **Image Processing**: Superpixel segmentation, HEIC conversion

### 📦 Project Structure

```
├── components/          # React components
│   ├── Canvas.tsx      # Main canvas component
│   ├── Artboard.tsx    # Visual rendering component
│   ├── Sidebar.tsx     # Control sidebar
│   ├── SettingsModal.tsx
│   └── ...
├── utils/              # Utilities
│   └── canvasExport.ts # Canvas API export renderer
├── services/           # API services
│   └── geminiService.ts # Gemini AI integration
├── public/             # Static assets
│   └── Wallpapers/    # 100+ gradient wallpapers
├── i18n.ts            # Internationalization
└── ...
```

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Credits

- Mesh gradient wallpapers from [ls.graphics](https://www.ls.graphics/products/mesh-gradients)
- Icons from [Lucide](https://lucide.dev/)

---

## 中文

### ✨ 功能特性

- 🎨 **精美界面** - 现代化、简洁的界面，流畅的动画效果
- 🖼️ **灵活边框** - 可调节的内边距、边框和圆角
- 🌈 **丰富背景** - 渐变色、纯色、壁纸和 AI 智能建议
- 🎯 **智能阴影** - 交互式阴影控制，可调节角度和强度
- 📐 **多种尺寸** - 支持多种输出尺寸比例
- 🤖 **AI 集成** - Gemini 驱动的背景色智能建议
- 🌌 **Aurora 背景** - 基于超像素分割的自然背景延伸
- 🌍 **双语支持** - 完整支持中英文
- 💾 **离线可用** - 完全离线工作（AI 功能除外）
- 🎭 **100+ 壁纸** - 内置精美的网格渐变壁纸
- 📤 **完美导出** - Canvas API 渲染确保像素级完美导出，无阴影裁切

### 🚀 快速开始

#### 前置要求

- Node.js 16+
- npm 或 yarn
- Rust（用于 Tauri 构建）

#### 安装

```bash
# 克隆仓库
git clone https://github.com/CyberDoctor2023/RoundFrame.git
cd roundframe

# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 生产构建
npm run tauri build
```

### 🎯 使用方法

1. **上传图片** - 拖放或点击选择图片
2. **调整设置** - 使用侧边栏自定义内边距、边框、阴影等
3. **选择背景** - 从渐变色、壁纸中选择，或使用 AI 建议
4. **导出** - 下载您精美的图片

### 🔑 AI 功能（可选）

使用 AI 智能背景建议：

1. 从 [Google AI Studio](https://aistudio.google.com/) 获取免费 API 密钥
2. 点击侧边栏的"API 密钥"按钮
3. 输入您的 API 密钥并保存
4. 点击"AI 匹配"获取智能背景建议

### 🛠️ 技术栈

- **前端**: React 19, TypeScript
- **样式**: Tailwind CSS 4
- **构建工具**: Vite 6
- **桌面应用**: Tauri 1.5
- **图标**: Lucide React
- **AI**: Google Gemini API
- **导出**: Canvas API（像素级完美渲染）
- **图像处理**: 超像素分割、HEIC 转换

### 📦 项目结构

```
├── components/          # React 组件
│   ├── Canvas.tsx      # 主画布组件
│   ├── Artboard.tsx    # 视觉渲染组件
│   ├── Sidebar.tsx     # 控制侧边栏
│   ├── SettingsModal.tsx
│   └── ...
├── utils/              # 工具函数
│   └── canvasExport.ts # Canvas API 导出渲染器
├── services/           # API 服务
│   └── geminiService.ts # Gemini AI 集成
├── public/             # 静态资源
│   └── Wallpapers/    # 100+ 渐变壁纸
├── i18n.ts            # 国际化
└── ...
```

### 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

### 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

### 🙏 致谢

- 网格渐变壁纸来自 [ls.graphics](https://www.ls.graphics/products/mesh-gradients)
- 图标来自 [Lucide](https://lucide.dev/)

---

<div align="center">
Made with ❤️ by the RoundFrame Team
</div>
