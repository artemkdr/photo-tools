---
applyTo: "**"
---

# Instagram Pano Cutter - Copilot Instructions

## Project Overview

A web-based tool to cut horizontal panorama photos into Instagram-ready carousel slides. Built with vanilla TypeScript + HTML/CSS, bundled with Bun.

## Tech Stack

- **Runtime/Bundler**: node.js (npm) + Vite
- **Language**: TypeScript (strict mode)
- **Framework**: None (vanilla TypeScript with class-based components)
- **Styling**: CSS with custom properties for theming
- **Build Target**: Modern browsers (ES2022)

## Project Structure

```
instagram-pano-cutter/
├── src/
│   ├── index.html          # Main HTML entry
│   ├── index.ts            # App initialization
│   ├── types.ts            # TypeScript interfaces and types
│   ├── components/         # UI components
│   │   ├── image-uploader.ts
│   │   ├── control-panel.ts
│   │   ├── slice-preview.ts
│   │   ├── download-panel.ts
│   │   └── theme-toggle.ts
│   ├── utils/              # Utility functions
│   │   ├── slicer.ts       # Core image slicing algorithm
│   │   └── download.ts     # Download functionality
│   └── styles/
│       └── main.css        # All styles with CSS variables
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   └── icons/              # App icons
├── package.json
├── tsconfig.json
└── copilot_instructions.md
```

## Theming

CSS custom properties are used for theming:

- Light theme: Default `:root` variables
- Dark theme: `[data-theme="dark"]` selector
- Auto theme: `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])`

Theme is stored in `localStorage` under key `instagram-pano-cutter-theme`.

## Instagram Aspect Ratios

Supported ratios for carousel slides:
- **Square (1:1)**: 1080×1080 pixels
- **Portrait (4:5)**: 1080×1350 pixels

## Code Style

- Use `const` by default, `let` only when reassignment needed
- Prefer early returns for error handling
- Use TypeScript strict mode features (explicit types, null checks)
- Keep functions focused and single-purpose
- Document public APIs with JSDoc comments

### Naming Conventions
- files: kebab-case (e.g., `image-uploader.ts`)
- Variables/Functions: camelCase (e.g., `sliceImage`)
- Classes: PascalCase (e.g., `ImageUploader`)

### Naming Ideology: Intention-Revealing
Name classes and operations to describe their effect and purpose, without reference to the means by which they do what they promise. This relieves the client developer of the need to understand the internals. These names should conform to the ubiquitous language so that team members can quickly infer their meaning.


## Development Commands

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Test
npm run test

# Production build
npm run build
```