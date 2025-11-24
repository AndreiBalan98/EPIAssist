# EPI Assist - Frontend

React + Vite medical documentation viewer with clean, minimal design.

## Structure

```
frontend/
├── public/
├── src/
│   ├── components/       # Reusable components
│   │   ├── SplashScreen.tsx
│   │   ├── DocumentViewer.tsx
│   │   ├── DocumentList.tsx
│   │   └── ChatInput.tsx
│   ├── pages/            # Page components
│   │   └── Home.tsx
│   ├── hooks/            # Custom hooks
│   │   └── useDocuments.ts
│   ├── services/         # API clients
│   │   └── api.ts
│   ├── utils/            # Utilities
│   │   └── logger.ts
│   ├── assets/           # Static assets
│   ├── App.tsx           # Root component
│   ├── main.tsx          # DOM mount
│   └── index.css         # Global styles
├── index.html
├── vite.config.ts
├── package.json
└── README.md
```

## Features

- **Splash Screen**: 1s fade-out on load
- **Document Viewer**: A4-width centered content
- **Document List**: Left sidebar, minimalist
- **Chat Input**: Bottom blue circle → input bar (no functionality yet)

## Setup

```bash
npm install
```

## Run

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## Environment Variables

Create `.env`:
```
VITE_API_URL=/api
```

## Architecture

- **Feature-based components**: Each in own folder
- **Custom hooks**: Shared logic in `hooks/`
- **Service layer**: API calls abstracted
- **Type safety**: Full TypeScript

## Styling

- TailwindCSS for utility classes
- Custom CSS for markdown rendering
- Minimal, clean design

## Testing

```bash
npm run test
```