import { useState, useEffect } from "react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { Download, Trash2, Scissors } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"
import { setupPdfWorker, pdfjsLib } from "@/lib/pdfWorker"

interface PDFPageInfo {
  index: number
  selected: boolean
  url: string
}

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PDFPageInfo[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectionMode, setSelectionMode] = useState<"custom" | "all" | "none">("custom")
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useEffect(() => {
    addRecentTool("split-pdf")
    setupPdfWorker()
  }, [addRecentTool])

  const handleFileSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
    setIsLoading(true)

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      
      const pageInfoList: PDFPageInfo[] = []
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.0 })
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        // Scale down for thumbnail
        const scale = 200 / viewport.width
        const scaledViewport = page.getViewport({ scale })
        
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height
        
        await page.render({
          canvasContext: ctx!,
          viewport: scaledViewport
        } as any).promise
        
        pageInfoList.push({
          index: i - 1, // 0-based for pdf-lib
          selected: true,
          url: canvas.toDataURL()
        })
      }
      
      setPages(pageInfoList)
    } catch (error) {
      console.error(error)
      toast.error("Failed to read PDF file.")
      setFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePageSelection = (index: number) => {
    setPages(prev => prev.map(p => p.index === index ? { ...p, selected: !p.selected } : p))
    setSelectionMode("custom")
  }

  const selectAll = () => {
    setPages(prev => prev.map(p => ({ ...p, selected: true })))
    setSelectionMode("all")
  }

  const deselectAll = () => {
    setPages(prev => prev.map(p => ({ ...p, selected: false })))
    setSelectionMode("none")
  }

  const handleSplit = async () => {
    if (!file) return

    const selectedIndices = pages.filter(p => p.selected).map(p => p.index)
    
    if (selectedIndices.length === 0) {
      toast.error("Please select at least one page to export.")
      return
    }

    setIsProcessing(true)
    const toastId = toast.loading("Splitting PDF...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      const newPdf = await PDFDocument.create()
      const copiedPages = await newPdf.copyPages(pdfDoc, selectedIndices)
      
      copiedPages.forEach(page => newPdf.addPage(page))
      
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      saveAs(blob, `split_${file.name}`)
      
      toast.success("PDF split successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to split PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const clearAll = () => {
    setFile(null)
    setPages([])
  }

  const sidebar = (
    <>
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-white">Selection Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={selectAll}
            className={`py-2 rounded-lg text-sm transition-colors border ${selectionMode === "all" ? "bg-blue-500/20 border-blue-500/50 text-white" : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"}`}
          >
            Select All
          </button>
          <button 
            onClick={deselectAll}
            className={`py-2 rounded-lg text-sm transition-colors border ${selectionMode === "none" ? "bg-white/20 border-white/50 text-white" : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"}`}
          >
            Deselect All
          </button>
        </div>
        <p className="text-xs text-white/40">
          Click on pages to toggle their selection. Only selected pages will be included in the final PDF.
        </p>
      </div>
      
      <div className="h-px bg-white/10 my-2" />

      <button
        onClick={handleSplit}
        disabled={!file || isProcessing || pages.filter(p => p.selected).length === 0}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
      >
        {isProcessing ? (
          <span className="animate-pulse">Splitting...</span>
        ) : (
          <>
            <Download size={20} />
            Export Selected ({pages.filter(p => p.selected).length})
          </>
        )}
      </button>

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
      title="Split PDF"
      description="Extract selected pages from your PDF to create a new document."
      icon={<Scissors size={24} className="text-blue-400" />}
      sidebar={sidebar}
      toolId="split-pdf"
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFileSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/50">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p>Rendering pages...</p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white truncate max-w-[70%]">{file.name}</h3>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/70">
              {pages.length} pages
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {pages.map((page) => (
                <div 
                  key={page.index} 
                  onClick={() => togglePageSelection(page.index)}
                  className={`relative aspect-[1/1.4] rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                    page.selected 
                      ? "border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                      : "border-transparent opacity-50 hover:opacity-100 hover:border-white/20"
                  }`}
                >
                  <img src={page.url} alt={`Page ${page.index + 1}`} className="w-full h-full object-cover bg-white" />
                  
                  {page.selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white/20">
                      ✓
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white">
                    {page.index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
