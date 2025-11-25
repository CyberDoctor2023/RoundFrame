export const translations = {
    zh: {
        // Header
        appName: '圆角描边',
        editMode: '编辑模式',
        noImageSelected: '未选择图片',

        // Sidebar - Style Section
        style: '样式',
        resetToDefaults: '重置为默认值',
        borderless: '纯背景',
        transparent: '纯描边',

        // Controls
        canvasPadding: '画布边距',
        borderWidth: '边框宽度',
        cornerRadius: '圆角半径',
        shadow: '阴影',
        intensity: '强度',
        light: '光源',
        lightDirection: '光源方向',

        // Image Scale
        imageScale: '图片缩放',
        zoom: '缩放',
        dragToReposition: '拖动图片以重新定位',

        // Background
        background: '背景',
        aiMatch: 'AI 匹配',
        thinking: '思考中...',
        aurora: 'Aurora',
        custom: '自定义',

        // Wallpapers
        wallpapers: '壁纸',
        meshGradientsBy: 'Mesh Gradients by ls.graphics',

        // Size/Ratio
        sizeRatio: '尺寸 / 比例',

        // Export
        exportImage: '导出图片',

        // API Key Modal
        apiKeyConfig: 'API 密钥配置',
        hrNote: 'HR你好：',
        hrNoteText: '目录里已提供 测试用API 密钥。',
        userNote: '用户你好：',
        userNoteText: '您可以从',
        googleAIStudio: 'Google AI Studio',
        getFreeApiKey: '获取免费的 API 密钥。',
        geminiApiKey: 'Gemini API 密钥',
        enterApiKey: '请输入您的 API 密钥',
        keyStoredLocally: '您的密钥仅存储在本地浏览器中，绝不会发送到任何其他服务器。',
        saveChanges: '保存更改',
        savedSuccessfully: '保存成功！',
        apiKey: 'API 密钥',
        setApiKey: '设置 API 密钥',

        // Footer
        version: 'v1.0.0 • Gemini 驱动',
    },
    en: {
        // Header
        appName: 'RoundFrame',
        editMode: 'Edit Mode',
        noImageSelected: 'No image selected',

        // Sidebar - Style Section
        style: 'Style',
        resetToDefaults: 'Reset to Defaults',
        borderless: 'Background Only',
        transparent: 'Outline Only',

        // Controls
        canvasPadding: 'Canvas Padding',
        borderWidth: 'Border Width',
        cornerRadius: 'Corner Radius',
        shadow: 'Shadow',
        intensity: 'Intensity',
        light: 'Light',
        lightDirection: 'Light Direction',

        // Image Scale
        imageScale: 'Image Scale',
        zoom: 'Zoom',
        dragToReposition: 'Drag image to reposition',

        // Background
        background: 'Background',
        aiMatch: 'AI Match',
        thinking: 'Thinking...',
        aurora: 'Aurora',
        custom: 'Custom',

        // Wallpapers
        wallpapers: 'Wallpapers',
        meshGradientsBy: 'Mesh Gradients by ls.graphics',

        // Size/Ratio
        sizeRatio: 'Size / Ratio',

        // Export
        exportImage: 'Export Image',

        // API Key Modal
        apiKeyConfig: 'API Key Configuration',
        hrNote: 'Note for Interviewers:',
        hrNoteText: 'Test API key provided in the directory.',
        userNote: 'For Users:',
        userNoteText: 'You can get a free API key from',
        googleAIStudio: 'Google AI Studio',
        getFreeApiKey: '.',
        geminiApiKey: 'Gemini API Key',
        enterApiKey: 'Enter your API Key',
        keyStoredLocally: 'Your key is stored locally in your browser and never sent to any other server.',
        saveChanges: 'Save Changes',
        savedSuccessfully: 'Saved Successfully!',
        apiKey: 'API Key',
        setApiKey: 'Set API Key',

        // Footer
        version: 'v1.0.0 • Gemini Powered',
    },
};

export type Language = 'zh' | 'en';
export type TranslationKey = keyof typeof translations.zh;
