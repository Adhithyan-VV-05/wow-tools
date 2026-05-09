import { useState } from "react"
import { removeBackground } from "@imgly/background-removal"
import { saveAs } from "file-saver"
import { Sparkles, Download, Trash2, Image as ImageIcon, Loader2, ShieldCheck, Zap } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"
import DownloadAction from "@/components/tools/DownloadAction"
import ResultPreview from "@/components/tools/ResultPreview"
import ErrorModal from "@/components/tools/ErrorModal"

export default function BackgroundRemover() {
  const [image, setImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [fileError, setFileError] = useState<{ title: string, message: string, filename?: string, solution?: string } | null>(null)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("background-remover")
  })

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setFileError({
        title: "Invalid File Type",
        message: "The selected file is not a supported image format.",
        filename: file.name,
        solution: "Please upload a PNG, JPG, or WEBP image."
      })
      return
    }

    setOriginalFile(file)
    setImage(URL.createObjectURL(file))
    setResultBlob(null)
  }

  const processImage = async () => {
    if (!originalFile) return

    setIsProcessing(true)
    const toastId = toast.loading("Removing background locally... This may take a moment.")

    try {
      // Configure for local execution
      const blob = await removeBackground(originalFile, {
        progress: (key, current, total) => {
          console.log(`Downloading ${key}: ${current}/${total}`)
        }
      })
      
      setResultBlob(blob)
      setImage(URL.createObjectURL(blob))
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`no-bg_${originalFile.name}`, blob.size, "Background Remover", "/tool/background-remover")
      
      toast.success("Background removed!", { id: toastId })
    } catch (error: any) {
      console.error(error)
      setFileError({
        title: "Processing Failed",
        message: "The AI model encountered an error while removing the background.",
        filename: originalFile.name,
        solution: "Your device might need more memory or the image format is corrupted. Try a smaller image."
      })
      toast.error("Failed to remove background.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (resultBlob && originalFile) {
      saveAs(resultBlob, `no-bg_${originalFile.name.split('.')[0]}.png`)
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-2 uppercase tracking-widest">
          <Zap size={14} /> AI Magic (Local)
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed">
          This tool uses a pre-trained AI model running entirely in your browser via WASM. No images are sent to any server.
        </p>
      </div>

      {resultBlob ? (
        <DownloadAction 
          blob={resultBlob} 
          defaultFilename={`wow_no-bg_${originalFile?.name.split('.')[0] || "image"}.png`}
          onDownload={() => setResultBlob(null)}
          onPreview={() => setShowPreview(true)}
        />
      ) : (
        <button
          onClick={processImage}
          disabled={!originalFile || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          Remove Background
        </button>
      )}

      {originalFile && (
        <button
          onClick={() => { setImage(null); setOriginalFile(null); setResultBlob(null) }}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10"
        >
          <Trash2 size={16} /> Clear
        </button>
      )}

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
          <ShieldCheck size={12} /> Privacy Guaranteed
        </div>
        <p className="text-[10px] text-white/30 leading-relaxed">
          All processing happens in your browser's memory.
        </p>
      </div>
    </div>
  )

  return (
    <ToolLayout
      title="Background Remover"
      description="Professional AI background removal that runs 100% locally on your device."
      icon={<Sparkles size={24} className="text-purple-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full items-center justify-center">
        {!image ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            acceptText="PNG, JPG, WEBP"
          />
        ) : (
          <div className="relative w-full max-w-2xl aspect-square md:aspect-video rounded-3xl overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-white/5 border border-white/10 flex items-center justify-center">
             <img src={image} alt="Preview" className="max-w-full max-h-full object-contain transition-all duration-700" />
             {isProcessing && (
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                 <Loader2 className="animate-spin mb-4" size={48} />
                 <p className="text-lg font-medium animate-pulse">Removing Background...</p>
                 <p className="text-xs text-white/40 mt-2">First run may take a while to download the model</p>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ResultPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        url={resultBlob ? URL.createObjectURL(resultBlob) : null}
        type="image"
        filename={`wow_no-bg_${originalFile?.name || "image.png"}`}
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
