import { useState } from "react"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { jsPDF } from "jspdf"
import * as pdfjsLib from "pdfjs-dist"
import { FileArchive, FileText, Download, Trash2, Zap, Package, ArchiveRestore } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

export default function ArchiveConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'pdf-to-zip' | 'zip-to-pdf'>('pdf-to-zip')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("archive-converter")
  })

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return
    const f = files[0]
    setFile(f)
    if (f.name.endsWith('.zip')) setMode('zip-to-pdf')
    else if (f.type === 'application/pdf') setMode('pdf-to-zip')
  }

  const convertPDFtoZIP = async () => {
    if (!file) return
    setIsProcessing(true)
    const toastId = toast.loading("Converting PDF pages to zipped images...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const zip = new JSZip()
      const imgFolder = zip.folder("images")

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({ canvasContext: ctx!, viewport }).promise
        const dataUrl = canvas.toDataURL("image/png")
        const base64Data = dataUrl.split(",")[1]
        imgFolder?.file(`page_${i}.png`, base64Data, { base64: true })
      }

      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, `${file.name.split('.')[0]}_pages.zip`)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`${file.name.split('.')[0]}_pages.zip`, content.size, "PDF to ZIP", "/tool/archive-converter")
      
      toast.success("ZIP archive created!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to create ZIP.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const convertZIPtoPDF = async () => {
    if (!file) return
    setIsProcessing(true)
    const toastId = toast.loading("Extracting images and building PDF...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      const pdf = new jsPDF()
      let first = true

      const files = Object.keys(zip.files).filter(name => /\.(png|jpg|jpeg|webp)$/i.test(name))
      
      for (const name of files) {
        const imgData = await zip.files[name].async("base64")
        const dataUrl = `data:image/png;base64,${imgData}`
        
        if (!first) pdf.addPage()
        
        const props = pdf.getImageProperties(dataUrl)
        const width = pdf.internal.pageSize.getWidth()
        const height = (props.height * width) / props.width
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
        first = false
      }

      pdf.save(`${file.name.split('.')[0]}.pdf`)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`${file.name.split('.')[0]}.pdf`, 0, "ZIP to PDF", "/tool/archive-converter")
      
      toast.success("PDF generated from ZIP!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to convert ZIP to PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Conversion Mode</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setMode('pdf-to-zip')}
            className={`w-full py-2 rounded-xl text-sm transition-all ${mode === 'pdf-to-zip' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40 hover:text-white"}`}
          >
            PDF to ZIP
          </button>
          <button 
            onClick={() => setMode('zip-to-pdf')}
            className={`w-full py-2 rounded-xl text-sm transition-all ${mode === 'zip-to-pdf' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40 hover:text-white"}`}
          >
            ZIP to PDF
          </button>
        </div>
      </div>

      <button
        onClick={mode === 'pdf-to-zip' ? convertPDFtoZIP : convertZIPtoPDF}
        disabled={!file || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
      >
        <Zap size={20} />
        {mode === 'pdf-to-zip' ? "Convert to ZIP" : "Convert to PDF"}
      </button>

      {file && (
        <button
          onClick={() => setFile(null)}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
        >
          <Trash2 size={16} /> Clear
        </button>
      )}
    </div>
  )

  return (
    <ToolLayout
      title="Archive Converter"
      description="Bundle PDF pages into a ZIP archive or convert an image-filled ZIP into a professional PDF document."
      icon={<Package size={24} className="text-yellow-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full items-center justify-center">
        {!file ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'application/pdf': ['.pdf'], 'application/zip': ['.zip'] }}
            acceptText="PDF or ZIP files"
          />
        ) : (
          <div className="max-w-md w-full p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
             <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-400 mx-auto mb-6">
               {mode === 'pdf-to-zip' ? <FileArchive size={32} /> : <FileText size={32} />}
             </div>
             <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
             <p className="text-sm text-white/40 mb-6">Ready to {mode === 'pdf-to-zip' ? "bundle pages into ZIP" : "convert ZIP images to PDF"}.</p>
             <div className="flex items-center gap-2 justify-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-[10px] font-bold uppercase">
               Local Browser Processing
             </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
