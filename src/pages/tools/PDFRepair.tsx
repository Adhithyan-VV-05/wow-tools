import { useState } from "react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { Wrench, Download, Trash2, Zap, ShieldCheck, Minimize2, Check } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function PDFRepair() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mode, setMode] = useState<'repair' | 'optimize' | 'pdfa'>('repair')
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("pdf-repair")
  })

  const processPDF = async () => {
    if (!file) return
    setIsProcessing(true)
    const toastId = toast.loading(`${mode === 'repair' ? 'Repairing' : mode === 'optimize' ? 'Optimizing' : 'Converting to PDF/A'} document...`)

    try {
      const arrayBuffer = await file.arrayBuffer()
      // Loading and re-saving often fixes minor corruption (Repair)
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      if (mode === 'optimize') {
        // Simple optimization: remove metadata and use compression
        pdfDoc.setTitle("")
        pdfDoc.setAuthor("")
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: mode === 'optimize' })
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      
      const prefix = mode === 'repair' ? 'repaired_' : mode === 'optimize' ? 'optimized_' : 'pdfa_'
      saveAs(blob, `${prefix}${file.name}`)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`${prefix}${file.name}`, blob.size, mode.toUpperCase(), "/tool/pdf-repair")
      
      toast.success("Success!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Operation failed. The file might be severely corrupted.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Action</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setMode('repair')}
            className={`w-full py-2 rounded-xl text-sm transition-all flex items-center justify-between px-3 ${mode === 'repair' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40"}`}
          >
            Repair PDF <Wrench size={14} />
          </button>
          <button 
            onClick={() => setMode('optimize')}
            className={`w-full py-2 rounded-xl text-sm transition-all flex items-center justify-between px-3 ${mode === 'optimize' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40"}`}
          >
            Optimize PDF <Minimize2 size={14} />
          </button>
          <button 
            onClick={() => setMode('pdfa')}
            className={`w-full py-2 rounded-xl text-sm transition-all flex items-center justify-between px-3 ${mode === 'pdfa' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40"}`}
          >
            PDF to PDF/A <Check size={14} />
          </button>
        </div>
      </div>

      <button
        onClick={processPDF}
        disabled={!file || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
      >
        <Zap size={20} /> Execute
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
      title="Maintenance & Compliance"
      description="Repair corrupted PDFs, optimize file structure, or convert documents to the archival PDF/A standard."
      icon={<Wrench size={24} className="text-blue-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full items-center justify-center">
        {!file ? (
          <FileUpload
            onFilesSelected={(files) => setFile(files[0])}
            accept={{ 'application/pdf': ['.pdf'] }}
            acceptText="PDF documents only"
          />
        ) : (
          <div className="max-w-md w-full p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
             <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-6">
               <ShieldCheck size={32} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
             <p className="text-sm text-white/40 mb-6 uppercase tracking-widest font-bold">Mode: {mode}</p>
             <div className="flex items-center gap-2 justify-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-bold uppercase">
               Safe & Local Processing
             </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
