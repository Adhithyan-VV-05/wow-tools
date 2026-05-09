import { useCallback } from "react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { motion } from "framer-motion"
import { UploadCloud } from "lucide-react"
import toast from "react-hot-toast"

interface FileUploadProps extends Omit<DropzoneOptions, 'onDrop'> {
  onFilesSelected: (files: File[]) => void
  acceptText?: string
  maxFilesText?: string
}

export default function FileUpload({ onFilesSelected, acceptText = "PDF files", maxFilesText = "Up to 50MB", ...dropzoneProps }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles)
  }, [onFilesSelected])

  const onDropRejected = useCallback((rejections: any) => {
    rejections.forEach(({ file, errors }: any) => {
      errors.forEach((err: any) => {
        if (err.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type.`)
        } else if (err.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Max size is 50MB.`)
        } else {
          toast.error(`${file.name}: ${err.message}`)
        }
      })
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxSize: 50 * 1024 * 1024, // 50MB
    ...dropzoneProps
  })

  return (
    <div
      {...getRootProps()}
      className={`relative flex-1 w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragActive 
          ? "border-blue-400 bg-blue-500/10 scale-[1.02]" 
          : "border-white/10 hover:border-white/30 hover:bg-white/5"
      }`}
    >
      <input {...getInputProps()} />
      
      {/* Animated Background Pulse when Dragging */}
      {isDragActive && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl -z-10"
        />
      )}

      <motion.div 
        animate={{ y: isDragActive ? -10 : 0 }}
        className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-xl border border-white/10"
      >
        <UploadCloud size={32} className={isDragActive ? "text-blue-400" : "text-white/50"} />
      </motion.div>
      
      <h3 className="text-2xl font-bold text-white mb-2">
        {isDragActive ? "Drop files now" : "Click or drag files here"}
      </h3>
      <p className="text-white/50 text-center max-w-sm mb-6">
        Your files are processed securely in your browser and never uploaded to any server.
      </p>

      <div className="flex gap-4 text-xs font-medium text-white/40">
        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">{acceptText}</span>
        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">{maxFilesText}</span>
      </div>
    </div>
  )
}
