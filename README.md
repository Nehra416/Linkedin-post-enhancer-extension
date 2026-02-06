# LinkedIn Post Enhancer

AI-powered Chrome extension to enhance your LinkedIn posts with better hooks, improved tone, and contextual optimization.

## Features

- **Quick Enhance**: One-click enhancement of your LinkedIn posts using AI
- **Advanced Mode**: Side panel with 3 tabs for detailed content optimization
  - **Enhance Tab**: Choose from 5 tones (Default, Excited, Story, Professional, Casual)
  - **Hooks Tab**: Generate attention-grabbing hooks for your posts
  - **Advanced Tab**: Contextual enhancement with role, motive, and writing style inputs
- **Direct Insert**: Insert enhanced content directly into LinkedIn editor

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key (starts with `sk-`)

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Extension

```bash
npm run build
```

This creates a `dist` folder with the production-ready extension.

### 4. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `dist` folder from this project

### 5. Configure API Key

1. Click the extension icon in Chrome toolbar
2. Enter your OpenAI API key
3. Click **Save**

## Usage

### Quick Enhancement

1. Go to LinkedIn and start a new post
2. Write your draft content
3. Click the **✨ Enhance** button below the editor
4. Your post is instantly enhanced!

### Advanced Mode

1. Write your draft content on LinkedIn
2. Click the **🎯 Advanced** button
3. Side panel opens with 3 tabs:
   - **Enhance**: View enhanced version, change tone, regenerate
   - **Hooks**: Get 3 powerful hooks, copy to clipboard, generate more
   - **Advanced**: Enter your role, motive, and writing style for contextual optimization
4. Click **Insert into LinkedIn** to apply changes

## Technology Stack

- React 19
- TypeScript
- Vite + CRXJS
- Tailwind CSS v4
- Zustand (state management)
- OpenAI SDK (client-side)
- Tabler Icons

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

## Color Palette

Extension uses Tailwind Neutral colors exclusively:

- Backgrounds: neutral-50, neutral-100, white
- Borders: neutral-200
- Text: neutral-900 (primary), neutral-600 (secondary)
- Buttons: neutral-900, neutral-600

## Version

**1.0.0** - MVP Release

---

Built with ❤️ by Nehra
