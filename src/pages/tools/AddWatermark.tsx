import { useState, useCallback } from "react"
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib"
import { saveAs } from "file-saver"
import { Stamp, Download, Trash2, Type, SlidersHorizontal, Settings2 } from "lucide-react"
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

export default function AddWatermark() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Watermark Settings
  const [text, setText] = useState("CONFIDENTIAL")
  const [opacity, setOpacity] = useState(0.3)
  const [rotation, setRotation] = useState(45)
  const [fontSize, setFontSize] = useState(60)
  const [color, setColor] = useState("#ff0000") // Red

  const [pages, setPages] = useState<{ url: string, width: number, height: number, index: number }[]>([])
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
    addRecentTool("add-watermark")
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
      
      // Attempt to load the PDF
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      
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

  const addWatermark = async () => {
    if (!file) return

    setIsProcessing(true)
    const toastId = toast.loading("Applying watermark...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const pages = pdfDoc.getPages()
      const textColor = hexToRgb(color)

      for (const page of pages) {
        const { width, height } = page.getSize()
        
        // Draw centered watermark
        page.drawText(text, {
          x: width / 2 - (text.length * fontSize * 0.3),
          y: height / 2,
          size: fontSize,
          font: font,
          color: textColor,
          opacity: opacity,
          rotate: degrees(rotation),
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      setProcessedBlob(blob)
      
      toast.success("Watermark applied! Ready to download.", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to apply watermark.", { id: toastId })
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
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Watermark Text</label>
          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. CONFIDENTIAL"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Opacity</label>
            <span className="text-xs text-blue-400 font-mono">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Rotation</label>
            <span className="text-xs text-blue-400 font-mono">{rotation}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Font Size</label>
            <span className="text-xs text-blue-400 font-mono">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="2"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Color</label>
          <div className="flex gap-2 flex-wrap">
            {['#ff0000', '#000000', '#3b82f6', '#22c55e', '#a855f7', '#f97316'].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? "border-white scale-110" : "border-transparent hover:scale-105"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-px bg-white/10 my-6" />

      {processedBlob ? (
        <DownloadAction 
          blob={processedBlob} 
          defaultFilename={`wow_watermark_${file?.name || "document.pdf"}`} 
          onDownload={() => setProcessedBlob(null)}
          onPreview={() => setShowPreview(true)}
        />
      ) : (
        <button
          onClick={addWatermark}
          disabled={!file || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-1">
              <span className="animate-pulse">Applying...</span>
            </div>
          ) : (
            <>
              <Stamp size={20} />
              Apply Watermark
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
      title="Add Watermark"
      description="Protect your documents by adding text watermarks locally."
      icon={<Stamp size={24} className="text-purple-400" />}
      sidebar={sidebar}
      secondarySidebar={secondarySidebar}
      toolId="add-watermark"
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
              
              {/* Watermark Overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
                style={{ zIndex: 10 }}
              >
                <div 
                  className="font-bold whitespace-nowrap transition-all duration-200 select-none"
                  style={{ 
                    color: color, 
                    opacity: opacity, 
                    transform: `rotate(${rotation}deg)`,
                    fontSize: `${(fontSize / 600) * page.width}px`, 
                    maxWidth: '90%'
                  }}
                >
                  {text || "WATERMARK"}
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
        filename={`wow_watermark_${file?.name || "document.pdf"}`}
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
