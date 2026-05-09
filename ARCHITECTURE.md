# WOW-Tools Architecture (Advanced AI Guide)

This document provides a technical overview of the WOW-Tools (Work On Web) architecture. It is designed for AI agents to understand the core patterns and extend the platform smoothly.

## 1. Core Principles
- **100% Client-Side**: All processing (PDF, Image, AI) happens in the user's browser using WASM and Web Workers.
- **Privacy First**: No data is uploaded to servers. Blobs are managed locally.
- **Glassmorphic UI**: Premium aesthetics using TailwindCSS, Framer Motion, and Lucide React.

## 2. Global State Management (`zustand`)
- **`useAppStore.ts`**: Centralized store for recent tools, search state, and user preferences.
- **Persistence**: Persisted to `wow-tools-storage` in LocalStorage.

## 4. Tool Categorization & Mega Menu
- **Structured Categories**: Tools are grouped into 10 logical categories (Merge & Split, Convert To PDF, etc.) as defined in `src/constants/tools.ts`.
- **Mega Menu (PC)**: A full-width dropdown in `Navbar.tsx` triggered on hover. Uses a multi-column grid layout for easy scanning.
- **Accordion Menu (Mobile)**: Integrated into the mobile navbar drawer. Each category is an expandable accordion for better vertical space management.

## 3. PDF Infrastructure (`pdfjs-dist` + `pdf-lib`)
- **Worker Setup**: Centralized in `src/lib/pdfWorker.ts`. 
  - **IMPORTANT**: Workers must be loaded via `?url` in Vite to prevent bundling conflicts.
- **Rendering Pattern**: 
  1. Load `ArrayBuffer`.
  2. Use `pdfjsLib` to get document/pages.
  3. Render to `HTMLCanvasElement` for high-fidelity previews.
- **Modification Pattern**: Use `pdf-lib` for structural changes (merge, watermark, sign, etc.).

## 4. Layout System (`ToolLayout.tsx`)
Standardized 3-column architecture for all document tools:
1. **Secondary Sidebar (Left)**: Multi-page navigation thumbnails (WhatsApp-style).
2. **Main Canvas (Center)**: The workspace/preview area.
3. **Options Sidebar (Right)**: Tool-specific controls and the `DownloadAction` component.

## 5. Standard Component Workflows
### File Upload
Use `FileUpload.tsx`. It provides standardized drag-and-drop and basic validation.
### Results & Downloading
Tools MUST NOT trigger automatic downloads. Use the `DownloadAction.tsx` + `ResultPreview.tsx` pattern:
1. **Process**: Generate a `Blob`.
2. **Preview**: Show `ResultPreview` modal.
3. **Download**: Once previewed, allow download via `DownloadAction` with custom filename input.

## 6. Extension Pattern (Adding a New Tool)
1. **Create Page**: Add `src/pages/tools/YourNewTool.tsx`.
2. **Register Tool**: Add entry in `src/constants/tools.ts`.
3. **Add Info**: Define metadata (How it works, warnings) in `src/constants/toolInfo.ts`.
4. **Implementation**:
   - Use `setupPdfWorker()` in `useEffect`.
   - Wrap content in `ToolLayout`.
   - Implement `handleFilesSelected` with `ErrorModal` support.
   - Implement `isProcessing` progress bar logic.

## 7. Advanced Modules
- **Background Removal**: `@imgly/background-removal` (WASM).
- **OCR**: `tesseract.js` (Web Worker).
- **Canvas Interaction**: `fabric.js` for complex overlays (Signatures, Editor).

## 8. Mobile Responsiveness (New)
- Sidebars use `AnimatePresence` and shift to collapsible drawers or bottom sheets on small screens.
- Use `md` and `lg` Tailwind breakpoints strictly for column layouts.
