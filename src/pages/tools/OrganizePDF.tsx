import { useState } from "react"
import { PDFDocument, degrees } from "pdf-lib"
import { LayoutGrid, Trash2, RotateCw, Copy, Loader2, FileText } from "lucide-react"
import { Reorder } from "framer-motion"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"
import { setupPdfWorker, pdfjsLib } from "@/lib/pdfWorker"
import { useEffect } from "react"
import DownloadAction from "@/components/tools/DownloadAction"
import ResultPreview from "@/components/tools/ResultPreview"
import ErrorModal from "@/components/tools/ErrorModal"

interface PageItem {
  id: string
  url: string
  rotation: number
  originalIndex: number
}

export default function OrganizePDF() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [fileError, setFileError] = useState<{ title: string, message: string, filename?: string, solution?: string } | null>(null)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useEffect(() => {
    addRecentTool("organize-pdf")
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
    const toastId = toast.loading("Rendering pages...")

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      const pageItems: PageItem[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.5 })
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({
          canvasContext: ctx!,
          viewport: viewport,
          canvas: canvas
        }).promise
        
        pageItems.push({
          id: Math.random().toString(36).substring(7),
          url: canvas.toDataURL(),
          rotation: 0,
          originalIndex: i - 1
        })
      }

      setPages(pageItems)
      toast.success("PDF loaded!", { id: toastId })
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
        solution = "Try 'Printing to PDF' to create a healthy copy."
      }

      setFileError({ title, message, filename: selectedFile.name, solution })
      setFile(null)
      toast.error("Failed to load PDF.", { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  const rotatePage = (id: string) => {
    setPages(prev => prev.map(p => 
      p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ))
  }

  const deletePage = (id: string) => {
    if (pages.length <= 1) {
      toast.error("A PDF must have at least one page.")
      return
    }
    setPages(prev => prev.filter(p => p.id !== id))
  }

  const duplicatePage = (id: string) => {
    const index = pages.findIndex(p => p.id === id)
    if (index === -1) return
    const page = pages[index]
    const newPage = { ...page, id: Math.random().toString(36).substring(7) }
    const newPages = [...pages]
    newPages.splice(index + 1, 0, newPage)
    setPages(newPages)
  }

  const handleSave = async () => {
    if (!file) return

    setIsProcessing(true)
    const toastId = toast.loading("Generating your organized PDF...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const sourcePdf = await PDFDocument.load(arrayBuffer)
      const outPdf = await PDFDocument.create()
      
      for (const pageItem of pages) {
        const [copiedPage] = await outPdf.copyPages(sourcePdf, [pageItem.originalIndex])
        copiedPage.setRotation(degrees((copiedPage.getRotation().angle + pageItem.rotation) % 360))
        outPdf.addPage(copiedPage)
      }

      const pdfBytes = await outPdf.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      setProcessedBlob(blob)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`wow_organized_${file.name}`, blob.size, "Organize PDF", "/tool/organize-pdf")
      
      toast.success("PDF ready!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF.", { id: toastId })
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
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Summary</div>
          <div className="text-2xl font-bold text-white">{pages.length}</div>
          <div className="text-sm text-white/60">Pages in final PDF</div>
        </div>

        {processedBlob ? (
          <DownloadAction 
            blob={processedBlob} 
            defaultFilename={`wow_organized_${file?.name || "document.pdf"}`}
            onDownload={() => setProcessedBlob(null)}
            onPreview={() => setShowPreview(true)}
          />
        ) : (
          <button
            onClick={handleSave}
            disabled={!file || pages.length === 0 || isProcessing}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <LayoutGrid size={20} />}
            Apply Changes
          </button>
        )}

        {file && (
          <button
            onClick={clearAll}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10"
          >
            <Trash2 size={16} />
            Reset
          </button>
        )}
      </div>
    </>
  )

  return (
    <ToolLayout
      title="Organize PDF"
      description="Rotate, delete, duplicate, and reorder PDF pages visually."
      icon={<LayoutGrid size={24} className="text-blue-400" />}
      sidebar={sidebar}
      toolId="organize-pdf"
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/50">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p>Processing pages...</p>
        </div>
      ) : (
        <div className="flex-1 h-full overflow-y-auto pr-2 -mr-2">
          <Reorder.Group axis="y" values={pages} onReorder={setPages} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
            {pages.map((page) => (
              <Reorder.Item key={page.id} value={page} className="relative group aspect-[1/1.4]">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-xl border-2 border-transparent group-hover:border-blue-500/50 transition-all cursor-grab active:cursor-grabbing relative">
                  <img 
                    src={page.url} 
                    alt="Page" 
                    className="w-full h-full object-cover transition-transform duration-300" 
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); rotatePage(page.id) }}
                        className="p-2 bg-white/10 hover:bg-blue-500 rounded-lg text-white transition-colors"
                        title="Rotate 90°"
                      >
                        <RotateCw size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); duplicatePage(page.id) }}
                        className="p-2 bg-white/10 hover:bg-blue-500 rounded-lg text-white transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deletePage(page.id) }}
                        className="p-2 bg-white/10 hover:bg-red-500 rounded-lg text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white/80">
                    #{pages.indexOf(page) + 1}
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <div className="mt-8 flex justify-center">
            <label className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-all flex items-center gap-2 text-sm font-medium">
              <FileText size={16} /> Add more pages...
              <input 
                type="file" 
                multiple 
                accept=".pdf" 
                className="hidden" 
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  handleFilesSelected(files)
                }} 
              />
            </label>
          </div>
        </div>
      )}
      {/* Modals */}
      <ResultPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        url={processedBlob ? URL.createObjectURL(processedBlob) : null}
        type="pdf"
        filename={`wow_organized_${file?.name || "document.pdf"}`}
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
