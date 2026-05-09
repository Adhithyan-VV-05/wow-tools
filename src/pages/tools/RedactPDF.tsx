import { useState, useRef, useEffect } from "react"
import { PDFDocument, rgb } from "pdf-lib"
import { ShieldAlert, Download, Trash2, Move } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"
import { setupPdfWorker, pdfjsLib } from "@/lib/pdfWorker"

export default function RedactPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [redactions, setRedactions] = useState<{ x: number, y: number, w: number, h: number, page: number }[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState(0)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useEffect(() => {
    addRecentTool("redact-pdf")
    setupPdfWorker()
  }, [addRecentTool])

  useEffect(() => {
    if (file) renderPage()
  }, [file, currentPage])

  const renderPage = async () => {
    if (!file || !canvasRef.current) return
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    setNumPages(pdf.numPages)
    const page = await pdf.getPage(currentPage)
    
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    await page.render({ canvasContext: context!, viewport, canvas }).promise
    
    // Draw existing redactions
    context!.fillStyle = "rgba(0,0,0,0.8)"
    redactions.filter(r => r.page === currentPage).forEach(r => {
      context!.fillRect(r.x, r.y, r.w, r.h)
    })
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Add a default redact box
    setRedactions([...redactions, { x: x - 50, y: y - 15, w: 100, h: 30, page: currentPage }])
    setTimeout(renderPage, 10)
  }

  const applyRedactions = async () => {
    if (!file) return
    setIsProcessing(true)
    const toastId = toast.loading("Permanently redacting sensitive info...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()

      redactions.forEach(r => {
        const page = pages[r.page - 1]
        const { height } = page.getSize()
        
        // Convert canvas coords to PDF coords
        // Scale 1.5 was used for rendering
        const pdfX = (r.x / 1.5) * (page.getWidth() / (canvasRef.current!.width / 1.5))
        const pdfY = height - ((r.y + r.h) / 1.5) * (page.getHeight() / (canvasRef.current!.height / 1.5))
        const pdfW = (r.w / 1.5) * (page.getWidth() / (canvasRef.current!.width / 1.5))
        const pdfH = (r.h / 1.5) * (page.getHeight() / (canvasRef.current!.height / 1.5))

        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: pdfW,
          height: pdfH,
          color: rgb(0, 0, 0),
        })
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `redacted_${file.name}`
      a.click()
      
      toast.success("Redaction complete!", { id: toastId })
    } catch (error) {
      toast.error("Failed to redact.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-2 uppercase tracking-widest">
          <ShieldAlert size={14} /> Permanent Redaction
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed">
          Boxes applied here will permanently obscure the underlying content. Click on the document to add a redaction box.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white">
          <Move size={16} className="rotate-180" />
        </button>
        <span className="text-sm font-bold text-white">{currentPage} / {numPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white">
          <Move size={16} />
        </button>
      </div>

      <button
        onClick={applyRedactions}
        disabled={!file || redactions.length === 0 || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500 text-white shadow-lg"
      >
        <Download size={20} /> Burn Redactions
      </button>

      {redactions.length > 0 && (
        <button
          onClick={() => { setRedactions([]); setTimeout(renderPage, 10); }}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
        >
          <Trash2 size={16} /> Clear All
        </button>
      )}
    </div>
  )

  return (
    <ToolLayout
      title="Redact PDF"
      description="Securely obscure sensitive information in your documents before sharing. Redactions are burned permanently into the PDF."
      icon={<ShieldAlert size={24} className="text-red-400" />}
      sidebar={sidebar}
      toolId="redact-pdf"
    >
      <div className="flex flex-col h-full items-center">
        {!file ? (
          <FileUpload
            onFilesSelected={(files) => setFile(files[0])}
            accept={{ 'application/pdf': ['.pdf'] }}
            acceptText="PDF documents only"
          />
        ) : (
          <div ref={containerRef} className="flex-1 overflow-auto w-full flex justify-center p-8 bg-black/20 rounded-3xl border border-white/10">
             <canvas 
               ref={canvasRef} 
               onClick={handleCanvasClick}
               className="shadow-2xl cursor-crosshair rounded-lg bg-white"
             />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
