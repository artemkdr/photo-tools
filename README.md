# Photo Tools

A collection of web-based photo processing tools that run entirely in your browser. All image processing happens locally - your photos never leave your device.

## 📦 Tools

### Instagram Pano Cutter

Cut horizontal panorama photos into Instagram carousel slides with precise control over aspect ratios and handling options.

**Features:**
- ✂️ **Smart Slicing**: Automatically slice panoramic photos into Instagram-ready carousel slides
- 📐 **Multiple Aspect Ratios**: Support for 1:1 (square) and 4:5 (portrait) Instagram formats
- 🎨 **Flexible Handling**: Choose how to handle uneven slices - crop, pad with custom colors, or fit to one slide
- 📱 **PWA Support**: Install as a Progressive Web App on any device
- 🎯 **Manual Padding**: Add custom padding (horizontal/vertical) before slicing for fine-tuned control
- 🖼️ **Wide Format Support**: Supports JPEG, PNG, GIF, WebP, AVIF, BMP, HEIC/HEIF, and various RAW formats (TIFF, DNG, NEF, PEF, etc.)
- 🌓 **Dark Mode**: Automatic theme switching based on system preferences
- 🔒 **Privacy First**: All processing happens in your browser - no uploads, no tracking
- ⚡ **Real-time Preview**: See your sliced images update as you adjust settings
- 💾 **Batch Download**: Download all slices at once as a ZIP file

**Technology Stack:**
- TypeScript
- Vite
- Native Web APIs (Canvas, OffscreenCanvas)
- PWA (Service Workers)
- Image format libraries: heic-decode, utif2

**Location:** `/instagram-pano-cutter`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/artemkdr/photo-tools.git
cd photo-tools
```

2. Navigate to the tool you want to use:
```bash
cd instagram-pano-cutter
```

3. Install dependencies:
```bash
npm install
# or
bun install
```

### Development

Run the development server:
```bash
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the project:
```bash
npm run build
# or
bun run build
```

Preview the production build:
```bash
npm run preview
# or
bun run preview
```

## 🛠️ Development Commands

Each tool in this repository includes the following npm scripts:

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run preview` - Preview production build locally
- `npm run lint` - Check code formatting and linting
- `npm run lint:fix` - Fix code formatting and linting issues
- `npm run typecheck` - Run TypeScript type checking
- `npm run precommit` - Run type checking and auto-fix linting (useful before commits)

## 📖 Usage Guide

### Instagram Pano Cutter

1. **Upload Your Image**: Drag and drop or click to select a panoramic photo
   - Supports most image formats including JPEG, PNG, HEIC, and RAW formats
   - Minimum dimensions: 500x500 pixels
   - Maximum dimensions: 10,000x10,000 pixels

2. **Configure Settings**:
   - **Aspect Ratio**: Choose between 1:1 (square) or 4:5 (portrait)
   - **Uneven Handling**: 
     - *Crop*: Trim the last slice to fit perfectly
     - *Pad*: Add padding to the last slice (choose your padding color)
     - *Fit to One Slide*: Scale the entire image to fit in a single slide
   - **Manual Padding**: Add extra padding around your image before slicing (in pixels)

3. **Preview**: See real-time preview of how your image will be sliced

4. **Download**: 
   - Download individual slices
   - Download all slices as a ZIP file
   - Files are automatically named with sequence numbers for easy Instagram upload

## 🏗️ Project Structure

```
photo-tools/
├── instagram-pano-cutter/          # Instagram Pano Cutter tool
│   ├── public/                     # Static assets
│   │   ├── icons/                  # PWA icons
│   │   └── manifest.json           # PWA manifest
│   ├── src/
│   │   ├── components/             # UI components
│   │   │   ├── control-panel.ts    # Settings panel
│   │   │   ├── download-panel.ts   # Download interface
│   │   │   ├── image-uploader/     # File upload component
│   │   │   ├── slice-preview.ts    # Preview canvas
│   │   │   └── theme-toggle.ts     # Dark mode toggle
│   │   ├── styles/                 # CSS styles
│   │   ├── utils/                  # Utility functions
│   │   │   ├── slicer.ts          # Core slicing logic
│   │   │   ├── canvas-factory.ts  # Canvas management
│   │   │   └── download.ts        # Download helpers
│   │   ├── types.ts               # TypeScript type definitions
│   │   └── index.ts               # Application entry point
│   ├── index.html                 # Main HTML file
│   ├── vite.config.ts             # Vite configuration
│   ├── tsconfig.json              # TypeScript configuration
│   ├── biome.json                 # Biome linter configuration
│   └── package.json               # Dependencies and scripts
└── README.md                      # This file
```

## 🔒 Privacy & Security

All photo processing happens entirely in your web browser using native JavaScript APIs:
- **No Server Uploads**: Your images are never uploaded to any server
- **No Data Collection**: No analytics, tracking, or telemetry
- **No External Dependencies for Processing**: Core image processing uses browser-native Canvas APIs
- **Open Source**: All code is publicly available for review

## 🧪 Code Quality

This project uses:
- **TypeScript** for type safety
- **Biome** for fast linting and formatting (based on @artemkdr/biome-base)
- **Strict type checking** enabled
- **PWA best practices** with service workers

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and type checking: `npm run precommit`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please ensure:
- Code passes TypeScript type checking (`npm run typecheck`)
- Code is properly formatted and linted (`npm run lint:fix`)
- New features include appropriate comments and documentation
- The app works in major browsers (Chrome, Firefox, Safari, Edge)

## 🐛 Known Limitations

- Some RAW format support depends on browser capabilities
- Large images (>10,000 pixels) are rejected to prevent performance issues
- Mobile browsers may have memory constraints with very large panoramas
- HEIC format requires additional processing time due to decoding

## 📄 License

This project is open source. Please check individual tool directories for specific license information.

## 👨‍💻 Author

**Artem Kudryavtsev**
- GitHub: [@artemkdr](https://github.com/artemkdr)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- HEIC decoding via [heic-decode](https://github.com/alexcorvi/heic-decode)
- TIFF decoding via [utif2](https://github.com/photopea/UTIF.js)
- Linting powered by [Biome](https://biomejs.dev/)

## 🗺️ Roadmap

Future enhancements being considered:
- Additional photo processing tools
- Support for vertical panoramas
- Custom output dimensions
- Image filters and adjustments
- Batch processing multiple images
- Video frame extraction

## 📞 Support

If you encounter any issues or have feature requests:
1. Check existing issues on GitHub
2. Open a new issue with detailed description
3. Include browser version and image format details for bug reports

---

Made with ❤️ by Artem Kudryavtsev. Processing your photos privately since 2025.
