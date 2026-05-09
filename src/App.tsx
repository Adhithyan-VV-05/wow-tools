import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Landing from "./pages/Landing"
import Tools from "./pages/Tools"
import Workspace from "./pages/Workspace"

// Lazy load tools for performance
const MergePDF = lazy(() => import("./pages/tools/MergePDF"))
const ImageCompressor = lazy(() => import("./pages/tools/ImageCompressor"))
const SplitPDF = lazy(() => import("./pages/tools/SplitPDF"))
const CompressPDF = lazy(() => import("./pages/tools/CompressPDF"))
const ImageToPDF = lazy(() => import("./pages/tools/ImageToPDF"))
const PDFToImage = lazy(() => import("./pages/tools/PDFToImage"))
const PDFEditor = lazy(() => import("./pages/tools/PDFEditor"))
const OCRImage = lazy(() => import("./pages/tools/OCRImage"))
const OCRPDF = lazy(() => import("./pages/tools/OCRPDF"))
const AddWatermark = lazy(() => import("./pages/tools/AddWatermark"))
const FlattenPDF = lazy(() => import("./pages/tools/FlattenPDF"))
const ExtractImages = lazy(() => import("./pages/tools/ExtractImages"))
const AddPageNumbers = lazy(() => import("./pages/tools/AddPageNumbers"))
const MarkdownToPDF = lazy(() => import("./pages/tools/MarkdownToPDF"))
const HTMLToPDF = lazy(() => import("./pages/tools/HTMLToPDF"))
const TextToPDF = lazy(() => import("./pages/tools/TextToPDF"))
const OrganizePDF = lazy(() => import("./pages/tools/OrganizePDF"))
const PDFMetadata = lazy(() => import("./pages/tools/PDFMetadata"))
const CodeToPDF = lazy(() => import("./pages/tools/CodeToPDF"))
const ImagePro = lazy(() => import("./pages/tools/ImagePro"))
const DataToPDF = lazy(() => import("./pages/tools/DataToPDF"))
const ImageConverter = lazy(() => import("./pages/tools/ImageConverter"))
const SignPDF = lazy(() => import("./pages/tools/SignPDF"))
const PDFSecurity = lazy(() => import("./pages/tools/PDFSecurity"))
const KeywordFinder = lazy(() => import("./pages/tools/KeywordFinder"))
const BackgroundRemover = lazy(() => import("./pages/tools/BackgroundRemover"))
const ExcelConverter = lazy(() => import("./pages/tools/ExcelConverter"))
const AdvancedSplit = lazy(() => import("./pages/tools/AdvancedSplit"))
const ArchiveConverter = lazy(() => import("./pages/tools/ArchiveConverter"))
const ScanToPDF = lazy(() => import("./pages/tools/ScanToPDF"))
const PDFRepair = lazy(() => import("./pages/tools/PDFRepair"))
const PDFLayoutPro = lazy(() => import("./pages/tools/PDFLayoutPro"))
const DocumentGenerators = lazy(() => import("./pages/tools/DocumentGenerators"))
const RedactPDF = lazy(() => import("./pages/tools/RedactPDF"))
const WebpageToPDF = lazy(() => import("./pages/tools/WebpageToPDF"))
const ProSuite = lazy(() => import("./pages/tools/ProSuite"))

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="tools" element={<Tools />} />
            <Route path="workspace" element={<Workspace />} />
            
            <Route path="tool">
              <Route path="merge-pdf" element={<MergePDF />} />
              <Route path="compress-image" element={<ImageCompressor />} />
              <Route path="split-pdf" element={<SplitPDF />} />
              <Route path="compress-pdf" element={<CompressPDF />} />
              <Route path="image-to-pdf" element={<ImageToPDF />} />
              <Route path="pdf-to-image" element={<PDFToImage />} />
              <Route path="pdf-editor" element={<PDFEditor />} />
              <Route path="ocr-image" element={<OCRImage />} />
              <Route path="ocr-pdf" element={<OCRPDF />} />
              <Route path="add-watermark" element={<AddWatermark />} />
              <Route path="flatten-pdf" element={<FlattenPDF />} />
              <Route path="extract-images" element={<ExtractImages />} />
              <Route path="add-page-numbers" element={<AddPageNumbers />} />
              <Route path="markdown-to-pdf" element={<MarkdownToPDF />} />
              <Route path="html-to-pdf" element={<HTMLToPDF />} />
              <Route path="text-to-pdf" element={<TextToPDF />} />
              <Route path="organize-pdf" element={<OrganizePDF />} />
              <Route path="pdf-metadata" element={<PDFMetadata />} />
              <Route path="code-to-pdf" element={<CodeToPDF />} />
              <Route path="image-pro" element={<ImagePro />} />
              <Route path="data-to-pdf" element={<DataToPDF />} />
              <Route path="image-converter" element={<ImageConverter />} />
              <Route path="sign-pdf" element={<SignPDF />} />
              <Route path="pdf-security" element={<PDFSecurity />} />
              <Route path="keyword-finder" element={<KeywordFinder />} />
              <Route path="background-remover" element={<BackgroundRemover />} />
              <Route path="excel-converter" element={<ExcelConverter />} />
              <Route path="advanced-split" element={<AdvancedSplit />} />
              <Route path="archive-converter" element={<ArchiveConverter />} />
              <Route path="scan-to-pdf" element={<ScanToPDF />} />
              <Route path="pdf-repair" element={<PDFRepair />} />
              <Route path="pdf-layout-pro" element={<PDFLayoutPro />} />
              <Route path="document-generators" element={<DocumentGenerators />} />
              <Route path="redact-pdf" element={<RedactPDF />} />
              <Route path="webpage-to-pdf" element={<WebpageToPDF />} />
              <Route path="pro-suite" element={<ProSuite />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
