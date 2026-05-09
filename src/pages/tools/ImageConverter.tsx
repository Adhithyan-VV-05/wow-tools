import { useState } from "react"
import { saveAs } from "file-saver"
import { Image as ImageIcon, Download, Trash2, ArrowRightLeft, FileType } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

const FORMATS = [
  { id: 'image/png', ext: 'png', name: 'PNG' },
  { id: 'image/jpeg', ext: 'jpg', name: 'JPG' },
  { id: 'image/webp', ext: 'webp', name: 'WebP' },
]

export default function ImageConverter() {
  const [files, setFiles] = useState<File[]>([])
  const [targetFormat, setTargetFormat] = useState('image/png')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("image-converter")
  })

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  const convertImage = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const toastId = toast.loading(`Converting ${files.length} image(s)...`)

    try {
      const recordHistory = useAppStore.getState().recordHistory
      const formatObj = FORMATS.find(f => f.id === targetFormat)

      for (const file of files) {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        await new Promise((resolve) => (img.onload = resolve))
        
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0)
        
        const blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob((b) => resolve(b), targetFormat, 0.9)
        )

        if (blob) {
          saveAs(blob, `converted_${file.name.split('.')[0]}.${formatObj?.ext}`)
          await recordHistory(`converted_${file.name.split('.')[0]}.${formatObj?.ext}`, blob.size, "Image Converter", "/tool/image-converter")
        }
      }
      
      toast.success("Batch conversion complete!", { id: toastId })
      setFiles([])
    } catch (error) {
      console.error(error)
      toast.error("Failed to convert some images.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <>
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Queue</div>
          <div className="text-2xl font-bold text-white">{files.length}</div>
          <div className="text-sm text-white/60">Images to convert</div>
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Target Format</label>
          <div className="grid grid-cols-1 gap-2">
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => setTargetFormat(f.id)}
                className={`px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between ${targetFormat === f.id ? "bg-blue-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                {f.name}
                {targetFormat === f.id && <FileType size={14} />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={convertImage}
          disabled={files.length === 0 || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <ArrowRightLeft size={20} />
          Convert & Download
        </button>

        {files.length > 0 && (
          <button
            onClick={() => setFiles([])}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
          >
            <Trash2 size={16} />
            Clear Queue
          </button>
        )}
      </div>
    </>
  )

  return (
    <ToolLayout
      title="Batch Image Converter"
      description="Convert multiple images between PNG, JPG, and WebP formats locally."
      icon={<ArrowRightLeft size={24} className="text-purple-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full">
        {files.length === 0 ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp'] }}
            acceptText="All image formats"
            multiple
          />
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-3 group relative">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
                    <img src={URL.createObjectURL(f)} alt="Preview" className="max-w-full max-h-full object-contain p-1" />
                  </div>
                  <div className="w-full min-w-0">
                    <p className="text-xs font-medium text-white truncate">{f.name}</p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">{(f.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button 
                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <div className="border-2 border-dashed border-white/5 rounded-2xl p-4 flex items-center justify-center">
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp'] }}
                  acceptText="Add more"
                  multiple
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
