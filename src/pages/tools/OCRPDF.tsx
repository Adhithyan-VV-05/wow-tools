import { useState } from "react"
import { createWorker } from "tesseract.js"
import { Copy, Trash2, Languages, Loader2, FileSearch } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"
import { useEffect } from "react"

import { setupPdfWorker, pdfjsLib } from "@/lib/pdfWorker"
import DownloadAction from "@/components/tools/DownloadAction"
import ResultPreview from "@/components/tools/ResultPreview"
import ErrorModal from "@/components/tools/ErrorModal"

const LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'hin', name: 'Hindi' },
  { code: 'mal', name: 'Malayalam' },
  { code: 'ara', name: 'Arabic' },
  { code: 'jpn', name: 'Japanese' },
]

export default function OCRPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedLang, setSelectedLang] = useState('eng')
  const [showPreview, setShowPreview] = useState(false)
  const [fileError, setFileError] = useState<{ title: string, message: string, filename?: string, solution?: string } | null>(null)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useEffect(() => {
    addRecentTool("ocr-pdf")
    setupPdfWorker()
  }, [addRecentTool])

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
    setExtractedText("")
    setProgress(0)
    setTotalPages(0)
    setResultBlob(null)
  }

  const runOCR = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    const toastId = toast.loading("Loading PDF...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      setTotalPages(pdf.numPages)
      
      let fullText = ""
      
      const worker = await createWorker(selectedLang, 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        }
      });

      for (let i = 1; i <= pdf.numPages; i++) {
        setCurrentPage(i)
        toast.loading(`Processing page ${i} of ${pdf.numPages}...`, { id: toastId })
        
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({
          canvasContext: ctx!,
          viewport: viewport,
          canvas: canvas
        }).promise
        
        const imageData = canvas.toDataURL('image/png')
        const { data: { text } } = await worker.recognize(imageData)
        fullText += `--- Page ${i} ---\n\n${text}\n\n`
      }

      setExtractedText(fullText)
      const blob = new Blob([fullText], { type: "text/plain" })
      setResultBlob(blob)
      await worker.terminate();
      
      toast.success("PDF OCR complete!", { id: toastId })
    } catch (error: any) {
      console.error("OCR Error:", error)
      let title = "OCR Failed"
      let message = "We couldn't extract text from this PDF."
      let solution = "Ensure the PDF is not password protected or try a clearer document."

      if (error.name === "PasswordException") {
        title = "Password Protected"
        message = "This PDF is encrypted with a password and cannot be scanned."
        solution = "Unlock the PDF first."
      }

      setFileError({ title, message, filename: file?.name, solution })
      toast.error("Failed to extract text from PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText)
    toast.success("Text copied to clipboard")
  }


  const clearAll = () => {
    setFile(null)
    setExtractedText("")
    setProgress(0)
    setTotalPages(0)
  }

  const sidebar = (
    <>
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Languages size={16} /> Language
        </label>
        <select 
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={isProcessing}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-[#16171d]">
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="h-px bg-white/10 my-2" />

      {extractedText ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={copyToClipboard}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all bg-white/10 hover:bg-white/20 text-white border border-white/10"
          >
            <Copy size={16} />
            Copy Text
          </button>
          
          <DownloadAction 
            blob={resultBlob}
            defaultFilename={`wow_ocr_${file?.name.split('.')[0] || "document"}.txt`}
            onDownload={() => setResultBlob(null)}
            onPreview={() => setShowPreview(true)}
          />
        </div>
      ) : (
        <button
          onClick={runOCR}
          disabled={!file || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-[10px]">{progress}%</span>
            </div>
          ) : (
            <>
              <FileSearch size={20} />
              Start PDF OCR
            </>
          )}
        </button>
      )}

      {file && (
        <button
          onClick={clearAll}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10"
        >
          <Trash2 size={16} />
          Clear
        </button>
      )}
    </>
  )

  return (
    <ToolLayout
      title="OCR PDF"
      description="Extract text from scanned PDF documents locally in your browser."
      icon={<FileSearch size={24} className="text-blue-400" />}
      sidebar={sidebar}
      toolId="ocr-pdf"
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : (
        <div className="flex flex-col h-full gap-6">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-white/50 uppercase tracking-wider">Document: {file.name}</h4>
            {isProcessing && totalPages > 0 && (
              <span className="text-xs font-mono text-blue-400">Page {currentPage} of {totalPages}</span>
            )}
          </div>
          
          <div className="flex-1 rounded-2xl overflow-hidden bg-black/40 border border-white/10 p-4 relative group">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm z-10">
                <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-blue-400 font-mono text-sm animate-pulse">Processing Page {currentPage}...</span>
                  <span className="text-white/30 text-xs">{progress}% complete for this page</span>
                </div>
              </div>
            ) : extractedText ? (
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none text-white/80 resize-none font-mono text-sm leading-relaxed"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                <FileSearch size={48} className="mb-4 opacity-10" />
                <p>Click "Start PDF OCR" to begin scanning</p>
                <p className="text-xs mt-2 text-white/10 max-w-xs text-center">Processing larger PDFs may take a few minutes as everything happens locally.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ResultPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        url={resultBlob ? URL.createObjectURL(resultBlob) : null}
        type="image" // Treat text blob as image preview or fix ResultPreview to handle txt
        filename={`wow_ocr_${file?.name || "document.txt"}`}
        onConfirm={() => toast.success("Preview confirmed!")}
      />

      <ErrorModal
        isOpen={!!fileError}
        onClose={() => setFileError(null)}
        error={fileError}
      />
    </ToolLayout>
  )
}
