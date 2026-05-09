import { useState } from "react"
import imageCompression from "browser-image-compression"
import { saveAs } from "file-saver"
import { Image as ImageIcon, Download, Trash2, SlidersHorizontal, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [quality, setQuality] = useState(0.7)
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("compress-image")
  })

  const handleFileSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (!selectedFile.type.startsWith('image/')) {
      toast.error("Please select an image file.")
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setCompressedFile(null)
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl)
      setCompressedUrl(null)
    }
  }

  const handleCompress = async () => {
    if (!file) return

    setIsProcessing(true)
    const toastId = toast.loading("Compressing image...")

    try {
      const options = {
        maxSizeMB: 1, // Will be scaled by quality roughly
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality,
      }

      const output = await imageCompression(file, options)
      setCompressedFile(output)
      setCompressedUrl(URL.createObjectURL(output))
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(output.name, output.size, "Compress Image", "/tool/compress-image")
      
      toast.success("Image compressed successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to compress image.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (compressedFile) {
      saveAs(compressedFile, `compressed_${file?.name || 'image.jpg'}`)
    }
  }

  const clearAll = () => {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setCompressedFile(null)
    if (compressedUrl) URL.revokeObjectURL(compressedUrl)
    setCompressedUrl(null)
  }

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB"
  }

  const compressionRatio = file && compressedFile 
    ? Math.round((1 - compressedFile.size / file.size) * 100) 
    : 0

  const sidebar = (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white flex items-center justify-between">
          <span className="flex items-center gap-2"><SlidersHorizontal size={16}/> Quality</span>
          <span className="text-blue-400">{Math.round(quality * 100)}%</span>
        </label>
        <input 
          type="range" 
          min="0.1" max="1" step="0.1" 
          value={quality} 
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="w-full accent-blue-500"
        />
        <p className="text-xs text-white/40 mt-1">
          Lower quality results in a smaller file size but may degrade image appearance.
        </p>
      </div>
      
      <div className="h-px bg-white/10 my-2" />

      {compressedFile ? (
        <button
          onClick={handleDownload}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)]"
        >
          <Download size={20} />
          Download Image
        </button>
      ) : (
        <button
          onClick={handleCompress}
          disabled={!file || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
        >
          {isProcessing ? (
            <span className="animate-pulse">Compressing...</span>
          ) : (
            "Compress Now"
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
      title="Compress Image"
      description="Reduce image file size instantly without sending your files to any server."
      icon={<ImageIcon size={24} className="text-purple-400" />}
      sidebar={sidebar}
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFileSelected}
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
          acceptText="PNG, JPG, WEBP"
        />
      ) : (
        <div className="flex flex-col h-full items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center w-full max-w-4xl">
            {/* Original Image */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square md:aspect-auto md:h-64 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center mb-4 relative group">
                {previewUrl && <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain p-2" />}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-white/80">
                  {formatSize(file.size)}
                </div>
              </div>
              <h4 className="text-white font-medium">Original</h4>
            </div>

            <div className="hidden md:flex flex-col items-center text-white/30">
              <ArrowRight size={32} />
            </div>

            {/* Compressed Image */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square md:aspect-auto md:h-64 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center mb-4 relative">
                {compressedUrl ? (
                  <>
                    <img src={compressedUrl} alt="Compressed" className="max-w-full max-h-full object-contain p-2" />
                    <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 border border-green-500/50 backdrop-blur-md px-2 py-1 rounded text-xs font-mono">
                      {formatSize(compressedFile!.size)}
                    </div>
                  </>
                ) : (
                  <div className="text-white/20 flex flex-col items-center">
                    <ImageIcon size={48} className="mb-2 opacity-50" />
                    <span>Preview will appear here</span>
                  </div>
                )}
              </div>
              <h4 className="text-white font-medium">
                Compressed {compressionRatio > 0 && <span className="text-green-400 text-sm ml-2">(-{compressionRatio}%)</span>}
              </h4>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
