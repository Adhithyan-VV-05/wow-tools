import { useState } from "react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { Scissors, Trash2, ArrowUpDown, ListOrdered, FileText } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function AdvancedSplit() {
  const [file, setFile] = useState<File | null>(null)
  const [range, setRange] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("advanced-split")
  })

  const handleReverse = async () => {
    if (!file) return
    setIsProcessing(true)
    const toastId = toast.loading("Reversing PDF pages...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const reversedDoc = await PDFDocument.create()
      
      const pageCount = pdfDoc.getPageCount()
      const indices = Array.from({ length: pageCount }, (_, i) => i).reverse()
      
      const copiedPages = await reversedDoc.copyPages(pdfDoc, indices)
      copiedPages.forEach(page => reversedDoc.addPage(page))

      const pdfBytes = await reversedDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      saveAs(blob, `reversed_${file.name}`)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`reversed_${file.name}`, blob.size, "Reverse PDF", "/tool/advanced-split")
      
      toast.success("PDF reversed!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to reverse PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSplitRange = async () => {
    if (!file || !range) return
    setIsProcessing(true)
    const toastId = toast.loading("Splitting PDF by range...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const splitDoc = await PDFDocument.create()
      
      // Parse range like "1-3, 5, 7-10"
      const parts = range.split(',').map(p => p.trim())
      const indices: number[] = []
      
      parts.forEach(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n) - 1)
          for (let i = start; i <= end; i++) {
            if (i >= 0 && i < pdfDoc.getPageCount()) indices.push(i)
          }
        } else {
          const idx = parseInt(part) - 1
          if (idx >= 0 && idx < pdfDoc.getPageCount()) indices.push(idx)
        }
      })

      if (indices.length === 0) {
        toast.error("Invalid range.", { id: toastId })
        setIsProcessing(false)
        return
      }

      const copiedPages = await splitDoc.copyPages(pdfDoc, indices)
      copiedPages.forEach(page => splitDoc.addPage(page))

      const pdfBytes = await splitDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      saveAs(blob, `split_range_${file.name}`)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`split_range_${file.name}`, blob.size, "Split by Range", "/tool/advanced-split")
      
      toast.success("PDF split successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to split PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div>
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Custom Range</label>
          <input 
            type="text"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all font-mono text-sm"
            placeholder="e.g. 1-3, 5, 8-10"
          />
        </div>
        <button
          onClick={handleSplitRange}
          disabled={!file || !range || isProcessing}
          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
        >
          <Scissors size={18} /> Split by Range
        </button>
      </div>

      <button
        onClick={handleReverse}
        disabled={!file || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
      >
        <ArrowUpDown size={20} /> Reverse All Pages
      </button>

      {file && (
        <button
          onClick={() => { setFile(null); setRange("") }}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
        >
          <Trash2 size={16} /> Clear
        </button>
      )}
    </div>
  )

  return (
    <ToolLayout
      title="Advanced PDF Split"
      description="Split PDFs by custom ranges or reverse the entire page order locally."
      icon={<Scissors size={24} className="text-orange-400" />}
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
             <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 mx-auto mb-6">
               <ListOrdered size={32} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
             <p className="text-sm text-white/40 mb-6">Ready for advanced splitting operations.</p>
             <div className="flex items-center gap-2 justify-center px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-[10px] font-bold uppercase">
               <FileText size={14} /> Total Pages Detected
             </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
