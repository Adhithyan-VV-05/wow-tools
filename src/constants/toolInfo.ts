export interface ToolInfo {
  howItWorks: string
  supported: string[]
  warnings: string[]
}

export const TOOL_INFO: Record<string, ToolInfo> = {
  "pdf-editor": {
    howItWorks: "Uses Fabric.js and PDF-Lib to overlay a transparent canvas on each PDF page. Your edits are rendered as high-resolution PNGs and then merged back into the original PDF structure.",
    supported: ["PDF 1.4+", "Standard Fonts", "Vector Graphics", "Images"],
    warnings: ["Large files may cause lag", "Complex form fields may not be editable", "Encrypted PDFs must be unlocked first"]
  },
  "organize-pdf": {
    howItWorks: "Parses the PDF document structure and allows reordering, rotation, and deletion of pages without re-encoding the entire content, preserving quality.",
    supported: ["All PDF versions", "Multi-file merging", "Page rotation"],
    warnings: ["Deleting all pages is not allowed", "Rotation is applied in 90° increments"]
  },
  "merge-pdf": {
    howItWorks: "Combines multiple PDF binary streams into a single document hierarchy using PDF-Lib.",
    supported: ["Multiple PDFs", "Encrypted PDFs (with password)", "Form merging"],
    warnings: ["Merging very large files may exceed browser memory limits"]
  },
  "split-pdf": {
    howItWorks: "Extracts specific page objects from the source PDF and creates new document wrappers for each range.",
    supported: ["Range selection", "Individual page extraction"],
    warnings: ["Links between split pages may break"]
  },
  "compress-pdf": {
    howItWorks: "Optimizes PDF size by downsampling images, removing unused objects, and flattening metadata.",
    supported: ["Image-heavy PDFs", "Scanned documents"],
    warnings: ["High compression may reduce image quality significantly"]
  },
  "add-watermark": {
    howItWorks: "Overlays text or images on the 'foreground' layer of every page using coordinate transformation.",
    supported: ["Text watermarks", "Custom opacity", "Rotation"],
    warnings: ["Watermarks can be removed by advanced PDF editors", "May obscure important text if opacity is too high"]
  },
  "sign-pdf": {
    howItWorks: "Generates a digital signature image (PNG) and embeds it into the PDF at the specified coordinates.",
    supported: ["Hand-drawn signatures", "Typed signatures", "Image uploads"],
    warnings: ["This is a visual signature, not a cryptographic digital certificate (PAdES)"]
  },
  "background-remover": {
    howItWorks: "Uses AI models (TensorFlow.js) locally in your browser to detect and isolate the primary subject from the background.",
    supported: ["JPG", "PNG", "WebP", "High contrast images"],
    warnings: ["Processing happens on your CPU/GPU; can be slow on older devices", "Works best with clear subjects"]
  },
  "ocr-pdf": {
    howItWorks: "Uses Tesseract.js to perform Optical Character Recognition on each page image to extract searchable text.",
    supported: ["Scanned PDFs", "Images", "Multiple languages"],
    warnings: ["Handwriting recognition is limited", "Low-resolution scans will have lower accuracy"]
  },
  "image-converter": {
    howItWorks: "Uses the browser's Canvas API to re-encode image data into different formats.",
    supported: ["PNG to JPG", "JPG to WebP", "HEIC (via fallback)"],
    warnings: ["Converting to JPG will lose transparency"]
  },
  "excel-converter": {
    howItWorks: "Uses SheetJS to parse spreadsheet data and JSPDF/AutoTable to generate formatted PDF tables.",
    supported: ["XLSX", "CSV", "XLS", "Multi-sheet support"],
    warnings: ["Complex Excel formatting (like charts) may not be preserved"]
  }
}

export const getToolInfo = (id: string): ToolInfo => {
  return TOOL_INFO[id] || {
    howItWorks: "Processes your files locally using browser APIs to ensure privacy and security.",
    supported: ["Standard file formats"],
    warnings: ["Do not refresh the page during processing"]
  }
}
