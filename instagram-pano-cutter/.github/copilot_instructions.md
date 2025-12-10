# Instagram Pano Cutter - Copilot Instructions

## Project Overview

A web-based tool to cut horizontal panorama photos into Instagram-ready carousel slides. Built with vanilla TypeScript + HTML/CSS, bundled with Bun.

## Tech Stack

- **Runtime/Bundler**: Bun
- **Language**: TypeScript (strict mode)
- **Framework**: None (vanilla TypeScript with class-based components)
- **Styling**: CSS with custom properties for theming
- **Build Target**: Modern browsers (ES2022)

## File Naming Convention

**Use kebab-case for all files:**
- `image-uploader.ts` ✓
- `ImageUploader.ts` ✗
- `slice-preview.ts` ✓
- `slicePreview.ts` ✗

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

## Component Pattern

Components are class-based with a consistent pattern:

```typescript
export class ComponentName {
  private element: HTMLElement;
  
  constructor(container: HTMLElement, ...callbacks) {
    this.element = this.render();
    container.appendChild(this.element);
    this.bindEvents();
  }
  
  private render(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'component-name';
    el.innerHTML = `...`;
    return el;
  }
  
  private bindEvents(): void {
    // Event listeners
  }
  
  // Public methods for external control
  public reset(): void { }
  public setVisible(visible: boolean): void { }
}
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

## Supported Image Formats

Native browser support only (no conversion libraries):
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- AVIF (.avif)
- BMP (.bmp)

**NOT supported** (show error message):
- HEIC/HEIF (iPhone native)
- RAW formats (ARW, CR2, NEF, etc.)
- TIFF

## Key Algorithms

### Image Slicing
1. Calculate slice width based on image height and target aspect ratio
2. Determine number of slices: `ceil(imageWidth / sliceWidth)`
3. For uneven last slice:
   - **Crop**: Center-crop to fit aspect ratio
   - **Pad**: Add equal padding on both sides with user-selected color

### Download Strategy
- Individual downloads: Direct `canvas.toBlob()` → `URL.createObjectURL()` → `<a download>`
- Batch download: Sequential with 150ms delay between files (prevents browser blocking)
- Output format: PNG (lossless quality)

## Development Commands

```bash
# Install dependencies
bun install

# Development server with hot reload
bun run dev

# Production build
bun run build
```

## Future Enhancements (Planned)

- [ ] HEIC/HEIF conversion support (for iPhone photos)
- [ ] Blur-fill padding option
- [ ] Quality/format selection for output
- [ ] Preview zoom on hover
- [ ] Undo/history support

## Code Style

- Use `const` by default, `let` only when reassignment needed
- Prefer early returns for error handling
- Use TypeScript strict mode features (explicit types, null checks)
- Keep functions focused and single-purpose
- Document public APIs with JSDoc comments
