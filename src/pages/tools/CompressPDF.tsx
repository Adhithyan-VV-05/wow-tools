import { useState } from "react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { FileText, Download, Trash2, Zap, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("compress-pdf")
  })

  const handleFileSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
    setCompressedBlob(null)
  }

  const handleCompress = async () => {
    if (!file) return

    setIsProcessing(true)
    const toastId = toast.loading("Optimizing PDF structure...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      
      // Basic optimization available in pdf-lib:
      // Strip metadata, remove unused objects, and re-serialize.
      pdfDoc.setTitle('')
      pdfDoc.setAuthor('')
      pdfDoc.setSubject('')
      pdfDoc.setKeywords([])
      pdfDoc.setProducer('wow-tools')
      pdfDoc.setCreator('wow-tools')

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true })
      
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      setCompressedBlob(blob)
      
      toast.success("PDF optimized successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to compress PDF. It might be encrypted or corrupted.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (compressedBlob && file) {
      saveAs(compressedBlob, `optimized_${file.name}`)
    }
  }

  const clearAll = () => {
    setFile(null)
    setCompressedBlob(null)
  }

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB"
  }

  const compressionRatio = file && compressedBlob 
    ? Math.round((1 - compressedBlob.size / file.size) * 100) 
    : 0

  const sidebar = (
    <>
      <div className="flex flex-col gap-2">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <h4 className="text-blue-400 font-medium mb-2 text-sm flex items-center gap-2">
            <Zap size={16} /> How it works
          </h4>
          <p className="text-xs text-white/50 leading-relaxed">
            Local browser PDF compression removes unused metadata, rebuilds object streams, and strips invisible data. 
            Note that it cannot heavily downsample embedded images like cloud servers do.
          </p>
        </div>
      </div>
      
      <div className="h-px bg-white/10 my-2" />

      {compressedBlob ? (
        <button
          onClick={handleDownload}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)]"
        >
          <Download size={20} />
          Download PDF
        </button>
      ) : (
        <button
          onClick={handleCompress}
          disabled={!file || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
        >
          {isProcessing ? (
            <span className="animate-pulse">Optimizing...</span>
          ) : (
            "Optimize PDF"
          )}
        </button>
      )}

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
      title="Compress PDF"
      description="Optimize your PDF file size and strip metadata locally without uploading."
      icon={<FileText size={24} className="text-blue-400" />}
      sidebar={sidebar}
      toolId="compress-pdf"
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFileSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : (
        <div className="flex flex-col h-full items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center w-full max-w-4xl">
            {/* Original PDF */}
            <div className="flex flex-col items-center">
              <div className="w-48 h-64 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex flex-col items-center justify-center mb-4 relative">
                <FileText size={64} className="text-blue-400/50 mb-4" />
                <p className="text-white font-medium text-center px-4 truncate w-full">{file.name}</p>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-white/80">
                  {formatSize(file.size)}
                </div>
              </div>
              <h4 className="text-white font-medium">Original</h4>
            </div>

            <div className="hidden md:flex flex-col items-center text-white/30">
              <ArrowRight size={32} />
            </div>

            {/* Compressed PDF */}
            <div className="flex flex-col items-center">
              <div className={`w-48 h-64 rounded-2xl overflow-hidden flex flex-col items-center justify-center mb-4 relative transition-colors ${compressedBlob ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5 border border-white/10 border-dashed'}`}>
                {compressedBlob ? (
                  <>
                    <FileText size={64} className="text-green-400 mb-4" />
                    <p className="text-white font-medium text-center px-4 truncate w-full">Optimized</p>
                    <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 border border-green-500/50 backdrop-blur-md px-2 py-1 rounded text-xs font-mono">
                      {formatSize(compressedBlob.size)}
                    </div>
                  </>
                ) : (
                  <div className="text-white/20 flex flex-col items-center">
                    <Zap size={48} className="mb-2 opacity-50" />
                    <span className="text-center px-4 text-sm">Ready to optimize</span>
                  </div>
                )}
              </div>
              <h4 className="text-white font-medium">
                Optimized 
                {compressionRatio > 0 && <span className="text-green-400 text-sm ml-2">(-{compressionRatio}%)</span>}
                {compressionRatio < 0 && <span className="text-red-400 text-sm ml-2">(+{Math.abs(compressionRatio)}%)</span>}
              </h4>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
