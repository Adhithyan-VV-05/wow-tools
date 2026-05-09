import { useState } from "react"
import { Reorder } from "framer-motion"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { FileText, Download, Trash2, GripVertical } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

interface PDFFile {
  id: string
  file: File
  name: string
  size: number
}

export default function MergePDF() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const addRecentTool = useAppStore(state => state.addRecentTool)

  // Register tool usage
  useState(() => {
    addRecentTool("merge-pdf")
  })

  const handleFilesSelected = (newFiles: File[]) => {
    const pdfFiles = newFiles
      .filter(f => f.type === "application/pdf")
      .map(f => ({
        id: Math.random().toString(36).substring(7),
        file: f,
        name: f.name,
        size: f.size
      }))
    
    if (pdfFiles.length !== newFiles.length) {
      toast.error("Some files were skipped because they are not PDFs.")
    }
    
    setFiles(prev => [...prev, ...pdfFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please add at least 2 PDF files to merge.")
      return
    }

    setIsProcessing(true)
    const toastId = toast.loading("Merging PDFs securely in your browser...")

    try {
      const mergedPdf = await PDFDocument.create()

      for (const pdfItem of files) {
        const arrayBuffer = await pdfItem.file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      saveAs(blob, "wow_merged.pdf")
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory("wow_merged.pdf", blob.size, "Merge PDF", "/tool/merge-pdf")
      
      toast.success("PDFs merged successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to merge PDFs. The files might be corrupted or password protected.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <>
      <div className="text-sm text-white/50 mb-4">
        Drag and drop files in the main area to reorder them before merging.
      </div>
      <button
        onClick={handleMerge}
        disabled={files.length < 2 || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
      >
        {isProcessing ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          <>
            <Download size={20} />
            Merge and Download
          </>
        )}
      </button>
      {files.length > 0 && (
        <button
          onClick={() => setFiles([])}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10"
        >
          <Trash2 size={16} />
          Clear All
        </button>
      )}
    </>
  )

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document locally in your browser."
      icon={<FileText size={24} className="text-blue-400" />}
      sidebar={sidebar}
      toolId="merge-pdf"
    >
      {files.length === 0 ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
          multiple
        />
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Selected Files</h3>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/70">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-3">
              {files.map((file) => (
                <Reorder.Item key={file.id} value={file} className="relative">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="cursor-grab active:cursor-grabbing p-2 text-white/30 hover:text-white transition-colors">
                      <GripVertical size={20} />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-white/40 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <div className="mt-4 border-t border-white/10 pt-4">
              <FileUpload
                onFilesSelected={handleFilesSelected}
                accept={{ 'application/pdf': ['.pdf'] }}
                acceptText="Add more PDFs"
                multiple
              />
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
