import { 
  ShieldCheck, 
  FileType, PenTool, 
  FilePlus,
  Brain,
  Minimize, Merge,
  Wand2,
  Binary,
  LayoutGrid
} from "lucide-react"

export const TOOL_CATEGORIES = [
  {
    title: "MERGE & SPLIT",
    icon: Merge,
    color: "text-blue-400",
    tools: [
      { id: "merge-pdf", name: "Merge PDF", desc: "Combine multiple PDFs into one", path: "/tool/merge-pdf" },
      { id: "split-pdf", name: "Split PDF", desc: "Extract pages from your PDF", path: "/tool/split-pdf" },
      { id: "extract-pages", name: "Extract Pages", desc: "Get specific pages from document", path: "/tool/split-pdf", isNew: true },
      { id: "remove-pages", name: "Remove Pages", desc: "Delete unwanted pages", path: "/tool/organize-pdf", isNew: true },
      { id: "organize-pdf", name: "Organize PDF", desc: "Rotate and reorder pages", path: "/tool/organize-pdf" },
      { id: "rotate-pdf", name: "Rotate PDF", desc: "Fix page orientation", path: "/tool/organize-pdf", isNew: true },
    ]
  },
  {
    title: "COMPRESS & OPTIMIZE",
    icon: Minimize,
    color: "text-cyan-400",
    tools: [
      { id: "compress-pdf", name: "Compress PDF", desc: "Reduce file size", path: "/tool/compress-pdf" },
      { id: "optimize-pdf", name: "Optimize PDF", desc: "Web optimization", path: "/tool/compress-pdf", isNew: true },
      { id: "repair-pdf", name: "Repair PDF", desc: "Fix corrupted files", path: "/tool/pdf-repair", isNew: true },
      { id: "ocr-pdf", name: "OCR PDF", desc: "Make scanned PDFs searchable", path: "/tool/ocr-pdf" },
      { id: "pdf-to-pdfa", name: "PDF to PDF/A", desc: "Archive standard format", path: "/tool/pdf-repair", isNew: true },
    ]
  },
  {
    title: "CONVERT TO PDF",
    icon: FilePlus,
    color: "text-indigo-400",
    tools: [
      { id: "jpg-to-pdf", name: "JPG to PDF", desc: "Convert images to PDF", path: "/tool/image-to-pdf" },
      { id: "word-to-pdf", name: "WORD to PDF", desc: "DOCX to PDF conversion", path: "/tool/word-converter", isNew: true },
      { id: "excel-to-pdf", name: "Excel to PDF", desc: "Spreadsheet to PDF", path: "/tool/excel-converter" },
      { id: "ppt-to-pdf", name: "PowerPoint to PDF", desc: "Slides to PDF", path: "/tool/ppt-converter", isNew: true },
      { id: "html-to-pdf", name: "HTML to PDF", desc: "Web pages to PDF", path: "/tool/html-to-pdf" },
    ]
  },
  {
    title: "CONVERT FROM PDF",
    icon: FileType,
    color: "text-orange-400",
    tools: [
      { id: "pdf-to-jpg", name: "PDF to JPG", desc: "Extract pages as images", path: "/tool/pdf-to-image" },
      { id: "pdf-to-word", name: "PDF to Word", desc: "Convert PDF to editable DOCX", path: "/tool/word-converter", isNew: true },
      { id: "pdf-to-excel", name: "PDF to Excel", desc: "Extract tables to XLSX", path: "/tool/excel-converter" },
      { id: "pdf-to-ppt", name: "PDF to PowerPoint", desc: "PDF to editable slides", path: "/tool/ppt-converter", isNew: true },
      { id: "pdf-to-png", name: "PDF to PNG", desc: "High-quality image extraction", path: "/tool/pdf-to-image" },
    ]
  },
  {
    title: "EDIT & ANNOTATE",
    icon: PenTool,
    color: "text-purple-400",
    tools: [
      { id: "edit-pdf", name: "Edit PDF", desc: "Full document editing", path: "/tool/pdf-editor" },
      { id: "add-watermark", name: "Add Watermark", desc: "Add text/image stamps", path: "/tool/add-watermark" },
      { id: "add-page-numbers", name: "Page Numbers", desc: "Add numbering to pages", path: "/tool/add-page-numbers" },
      { id: "crop-pdf", name: "Crop PDF", desc: "Adjust page margins", path: "/tool/image-pro", isNew: true },
      { id: "sign-pdf", name: "Sign PDF", desc: "Draw or type signatures", path: "/tool/sign-pdf" },
    ]
  },
  {
    title: "SECURITY & PROTECTION",
    icon: ShieldCheck,
    color: "text-emerald-400",
    tools: [
      { id: "protect-pdf", name: "Protect PDF", desc: "Add password and encryption", path: "/tool/pdf-security" },
      { id: "unlock-pdf", name: "Unlock PDF", desc: "Remove password protection", path: "/tool/pdf-security", isNew: true },
      { id: "redact-pdf", name: "Redact PDF", desc: "Black out sensitive info", path: "/tool/redact-pdf", isNew: true },
      { id: "compare-pdf", name: "Compare PDF", desc: "Find differences between files", path: "/tool/pro-suite", isNew: true },
    ]
  },
  {
    title: "TEXT & DATA TOOLS",
    icon: Binary,
    color: "text-blue-500",
    tools: [
      { id: "text-to-pdf", name: "Text to PDF", desc: "TXT to PDF conversion", path: "/tool/text-to-pdf" },
      { id: "pdf-to-text", name: "PDF to Text", desc: "Extract plain text", path: "/tool/ocr-pdf" },
      { id: "json-to-pdf", name: "JSON to PDF", desc: "Data to document", path: "/tool/data-to-pdf" },
      { id: "add-links", name: "Add Links to PDF", desc: "Insert clickable links", path: "/tool/pdf-editor", isNew: true },
      { id: "pdf-metadata", name: "PDF Metadata", desc: "Edit document info", path: "/tool/pdf-metadata" },
      { id: "font-extractor", name: "Font Extractor", desc: "Get embedded fonts", path: "/tool/pro-suite" },
      { id: "view-pdf", name: "View PDF", desc: "Fast browser viewer", path: "/tool/pdf-editor" },
    ]
  },
  {
    title: "PAGE MANAGEMENT",
    icon: LayoutGrid,
    color: "text-sky-400",
    tools: [
      { id: "split-by-size", name: "Split by Size", desc: "Split based on file weight", path: "/tool/advanced-split" },
      { id: "split-by-range", name: "Split by Range", desc: "Extract custom ranges", path: "/tool/advanced-split" },
      { id: "reverse-pdf", name: "Reverse PDF", desc: "Flip page order", path: "/tool/advanced-split" },
      { id: "duplicate-pages", name: "Duplicate Pages", desc: "Clone pages in document", path: "/tool/organize-pdf" },
    ]
  },
  {
    title: "PDF EDITOR",
    icon: Wand2,
    color: "text-pink-400",
    tools: [
      { id: "draw-on-pdf", name: "Draw on PDF", desc: "Freehand drawing", path: "/tool/pdf-editor" },
      { id: "highlight-pdf", name: "Highlight PDF", desc: "Mark important text", path: "/tool/pdf-editor" },
      { id: "add-text-to-pdf", name: "Add Text to PDF", desc: "Type on your PDF", path: "/tool/pdf-editor" },
      { id: "erase-pdf", name: "Erase Content", desc: "Remove parts of pages", path: "/tool/pdf-editor", isNew: true },
    ]
  },
  {
    title: "SMART & CREATION TOOLS",
    icon: Brain,
    color: "text-yellow-400",
    tools: [
      { id: "image-to-pdf", name: "Image to PDF", desc: "Batch image conversion", path: "/tool/image-to-pdf" },
      { id: "scan-to-pdf", name: "Scan to PDF", desc: "Camera to PDF", path: "/tool/scan-to-pdf" },
      { id: "ai-summarizer", name: "AI PDF Summarizer", desc: "AI document insights", path: "/tool/pro-suite" },
      { id: "add-borders", name: "Add Borders", desc: "Decorative layout borders", path: "/tool/pdf-layout-pro" },
      { id: "grayscale-pdf", name: "Grayscale PDF", desc: "Convert to B&W", path: "/tool/pdf-layout-pro", isNew: true },
      { id: "delete-blank-pages", name: "Delete Blank Pages", desc: "Auto-remove empty pages", path: "/tool/pdf-layout-pro", isNew: true },
    ]
  }
]

export const ALL_TOOLS = TOOL_CATEGORIES.flatMap(cat => 
  cat.tools.map(tool => ({ ...tool, category: cat.title, categoryIcon: cat.icon }))
)
