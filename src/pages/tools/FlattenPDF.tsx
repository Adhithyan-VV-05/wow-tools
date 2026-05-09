import { useState, useCallback } from "react"
import { PDFDocument } from "pdf-lib"
import * as pdfjsLib from "pdfjs-dist"
import { saveAs } from "file-saver"
import { Layers, Download, Trash2, ShieldCheck, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

export default function FlattenPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("flatten-pdf")
  })

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
  }

  const flattenPDF = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    const toastId = toast.loading("Loading PDF...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const outPdf = await PDFDocument.create()
      
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 100))
        toast.loading(`Flattening page ${i} of ${pdf.numPages}...`, { id: toastId })
        
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 }) // High quality
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({
          canvasContext: ctx!,
          viewport: viewport
        } as any).promise
        
        const imageData = canvas.toDataURL('image/jpeg', 0.85)
        const image = await outPdf.embedJpg(imageData)
        
        const newPage = outPdf.addPage([viewport.width, viewport.height])
        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        })
      }

      const pdfBytes = await outPdf.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      saveAs(blob, `flattened_${file.name}`)
      
      toast.success("PDF flattened successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to flatten PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const clearAll = () => {
    setFile(null)
    setProgress(0)
  }

  const sidebar = (
    <>
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
        <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
          <ShieldCheck size={16} /> What is Flattening?
        </h4>
        <p className="text-xs text-white/50 leading-relaxed">
          Flattening converts every page into an image. This makes the text un-selectable and ensures that annotations, form fields, and signatures cannot be edited or removed.
        </p>
      </div>

      <button
        onClick={flattenPDF}
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
            <Layers size={20} />
            Flatten PDF
          </>
        )}
      </button>

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

  return (
    <ToolLayout
      title="Flatten PDF"
      description="Make your PDF un-editable by converting all pages into static images."
      icon={<Layers size={24} className="text-blue-400" />}
      sidebar={sidebar}
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : (
        <div className="flex flex-col h-full items-center justify-center">
          <div className="p-12 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-6 max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Layers size={40} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
              <p className="text-white/40 text-sm">
                This process will convert all content into images. The text will no longer be searchable or selectable.
              </p>
            </div>
            {isProcessing && (
              <div className="w-full space-y-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-blue-400 font-mono">Processing: {progress}%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
