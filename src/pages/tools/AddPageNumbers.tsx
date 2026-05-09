import { useState, useCallback } from "react"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { saveAs } from "file-saver"
import { Hash, Download, Trash2, Settings2, AlignCenter, AlignLeft, AlignRight } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"
import { setupPdfWorker, pdfjsLib } from "@/lib/pdfWorker"
import { useEffect, useRef } from "react"
import PageThumbnail from "@/components/tools/PageThumbnail"
import DownloadAction from "@/components/tools/DownloadAction"
import ResultPreview from "@/components/tools/ResultPreview"
import ErrorModal from "@/components/tools/ErrorModal"
import { motion } from "framer-motion"

export default function AddPageNumbers() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Settings
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'top-center'>('bottom-center')
  const [format, setFormat] = useState('Page {n} of {total}')
  const [fontSize, setFontSize] = useState(12)
  const [color, setColor] = useState("#666666")

  const [pages, setPages] = useState<{ url: string, width: number, height: number, index: number }[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [fileError, setFileError] = useState<{ title: string, message: string, filename?: string, solution?: string } | null>(null)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useEffect(() => {
    addRecentTool("add-page-numbers")
    setupPdfWorker()
  }, [addRecentTool])

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
    setIsLoading(true)
    setLoadProgress(0)
    setProcessedBlob(null)
    const toastId = toast.loading("Processing PDF...")

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setTotalPages(pdf.numPages)
      const pagePreviews: { url: string, width: number, height: number, index: number }[] = []

      const pagesToLoad = Math.min(pdf.numPages, 20)
      for (let i = 1; i <= pagesToLoad; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.5 })
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({ canvasContext: ctx!, viewport }).promise
        pagePreviews.push({ 
          url: canvas.toDataURL(),
          width: viewport.width * 2,
          height: viewport.height * 2,
          index: i - 1
        })
        setLoadProgress(Math.round((i / pagesToLoad) * 100))
      }

      setPages(pagePreviews)
      toast.success("PDF loaded successfully!", { id: toastId })
    } catch (error: any) {
      console.error("PDF Load Error:", error)
      let title = "File Error"
      let message = "We couldn't open this PDF file."
      let solution = "Try a different file or ensure it's not password protected."

      if (error.name === "PasswordException") {
        title = "Password Protected"
        message = "This PDF is encrypted with a password and cannot be processed."
        solution = "Remove the password using a PDF unlocker tool first."
      } else if (error.message.includes("Invalid PDF structure")) {
        title = "Corrupted File"
        message = "The PDF structure is invalid or the file is corrupted."
        solution = "Try opening it in a PDF viewer and 'Printing to PDF' to create a healthy copy."
      }

      setFileError({ title, message, filename: selectedFile.name, solution })
      setFile(null)
      toast.error("Failed to load PDF.", { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return rgb(r, g, b)
  }

  const applyPageNumbers = async () => {
    if (!file) return

    setIsProcessing(true)
    const toastId = toast.loading("Adding page numbers...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      const textColor = hexToRgb(color)

      pages.forEach((page, idx) => {
        const { width, height } = page.getSize()
        const text = format.replace('{n}', (idx + 1).toString()).replace('{total}', pages.length.toString())
        
        let x = 0
        let y = 0
        
        const textWidth = font.widthOfTextAtSize(text, fontSize)

        if (position === 'bottom-center') {
          x = width / 2 - textWidth / 2
          y = 30
        } else if (position === 'bottom-right') {
          x = width - textWidth - 30
          y = 30
        } else if (position === 'top-center') {
          x = width / 2 - textWidth / 2
          y = height - 40
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: textColor,
        })
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      setProcessedBlob(blob)
      
      toast.success("Page numbers added! Ready to download.", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to add page numbers.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const clearAll = () => {
    setFile(null)
  }

  const sidebar = (
    <>
      <div className="space-y-6">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Format</label>
          <input
            type="text"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. Page {n}"
          />
          <p className="text-[10px] text-white/30 mt-1">Use {'{n}'} for page and {'{total}'} for total.</p>
        </div>

        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Position</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'bottom-center', label: 'Bottom Center', icon: <AlignCenter size={14} /> },
              { id: 'bottom-right', label: 'Bottom Right', icon: <AlignRight size={14} /> },
              { id: 'top-center', label: 'Top Center', icon: <AlignCenter size={14} /> },
            ].map(pos => (
              <button
                key={pos.id}
                onClick={() => setPosition(pos.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${position === pos.id ? "bg-blue-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                {pos.icon}
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Font Size</label>
            <span className="text-xs text-blue-400 font-mono">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="8"
            max="24"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
      
      <div className="h-px bg-white/10 my-6" />

      {processedBlob ? (
        <DownloadAction 
          blob={processedBlob} 
          defaultFilename={`wow_numbered_${file?.name || "document.pdf"}`}
          onDownload={() => setProcessedBlob(null)}
          onPreview={() => setShowPreview(true)}
        />
      ) : (
        <button
          onClick={applyPageNumbers}
          disabled={!file || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          {isProcessing ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              <Hash size={20} />
              Add Page Numbers
            </>
          )}
        </button>
      )}

      {file && (
        <button
          onClick={clearAll}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
        >
          <Trash2 size={16} />
          Clear
        </button>
      )}
    </>
  )

  const secondarySidebar = pages.length > 0 ? (
    <>
      {pages.map((page, i) => (
        <PageThumbnail
          key={i}
          url={page.url}
          index={i}
          isActive={activePageIndex === i}
          onClick={() => {
            setActivePageIndex(i)
            pageRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        />
      ))}
    </>
  ) : null

  return (
    <ToolLayout
      title="Page Numbers"
      description="Add customizable page numbering to your PDF documents."
      icon={<Hash size={24} className="text-sky-400" />}
      sidebar={sidebar}
      secondarySidebar={secondarySidebar}
      toolId="add-page-numbers"
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden mb-4">
            <motion.div 
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-sm font-medium animate-pulse">Rendering PDF pages ({loadProgress}%)...</p>
        </div>
      ) : (
        <div 
          ref={scrollContainerRef}
          className="flex-1 h-full overflow-y-auto p-4 space-y-8 custom-scrollbar scroll-smooth"
        >
          {pages.map((page, idx) => (
            <div 
              key={idx} 
              ref={el => pageRefs.current[idx] = el}
              className="relative mx-auto bg-white shadow-2xl rounded-sm overflow-hidden" 
              style={{ width: 'fit-content' }}
            >
              <img src={page.url} alt={`Page ${idx + 1}`} className="max-w-full block" />
              
              {/* Page Number Overlay */}
              <div 
                className={`absolute inset-0 p-8 flex pointer-events-none ${
                  position === 'top-center' ? 'items-start justify-center' :
                  position === 'bottom-center' ? 'items-end justify-center' :
                  'items-end justify-end'
                }`}
                style={{ zIndex: 10 }}
              >
                <div 
                  className="font-medium transition-all duration-200 select-none bg-white/80 px-2 py-0.5 rounded shadow-sm border border-black/5"
                  style={{ 
                    color: color, 
                    fontSize: `${(fontSize / 600) * page.width}px`,
                  }}
                >
                  {format.replace('{n}', (idx + 1).toString()).replace('{total}', totalPages.toString())}
                </div>
              </div>
              
              <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white z-20">
                Page {idx + 1}
              </div>
            </div>
          ))}
          {file && pages.length === 20 && (
             <p className="text-center text-white/20 text-xs mt-4 italic">Preview limited to first 20 pages</p>
          )}
        </div>
      )}

      {/* Modals */}
      <ResultPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        url={processedBlob ? URL.createObjectURL(processedBlob) : null}
        type="pdf"
        filename={`wow_numbered_${file?.name || "document.pdf"}`}
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
