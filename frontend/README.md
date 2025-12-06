# EPI Assist - Frontend

React + Vite medical documentation viewer with AI chat.

## Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ChatInput.tsx         # AI chat input (floating)
│   │   ├── DocumentSelector.tsx  # Document picker (top-left)
│   │   ├── DocumentViewer.tsx    # Markdown renderer
│   │   ├── ErrorBoundary.tsx     # Error handling
│   │   ├── FloatingTOC.tsx       # Table of contents (right)
│   │   ├── SkeletonLoader.tsx    # Loading state
│   │   └── SplashScreen.tsx      # Initial splash
│   ├── hooks/
│   │   └── useDocuments.ts       # Document operations
│   ├── pages/
│   │   └── Home.tsx              # Main page
│   ├── services/
│   │   └── api.ts                # Backend API client
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── package.json
└── README.md
```

## Features

- **Splash Screen**: Fade-out on load
- **Document Viewer**: A4-width centered markdown
- **Document Selector**: Floating top-left, expands on hover
- **Table of Contents**: Floating right, low opacity
- **AI Chat**: Floating bottom center, expandable input

## Setup

```bash
npm install
```

## Run

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## Environment Variables

Create `.env` from example:
```bash
cp .env.example .env
```

For development, leave empty (uses proxy to localhost:8000).
For production, set full backend URL:
```env
VITE_API_URL=https://your-backend.com/api
```

## Architecture

- **Feature-based components**: Each component in own file
- **Custom hooks**: Shared logic in `hooks/`
- **Service layer**: API calls abstracted in `services/`
- **Path aliases**: `@components`, `@services`, `@hooks`, `@utils`

## AI Chat Flow

1. User types message in chat input
2. Message sent to backend `/api/chat`
3. Backend processes with OpenAI
4. Response displayed in markdown

No document context is sent - all AI logic handled server-side.

## Styling

- TailwindCSS utility classes
- Custom prose styles for markdown
- Minimal, clean design