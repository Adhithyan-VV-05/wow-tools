import { useState } from "react"
import { Reorder } from "framer-motion"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { Image as ImageIcon, Download, Trash2, GripVertical, Settings2 } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

interface ImageFile {
  id: string
  file: File
  name: string
  previewUrl: string
}

export default function ImageToPDF() {
  const [files, setFiles] = useState<ImageFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageSize, setPageSize] = useState<"fit" | "A4">("fit")
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("image-to-pdf")
  })

  const handleFilesSelected = (newFiles: File[]) => {
    const validFiles = newFiles
      .filter(f => f.type.startsWith("image/"))
      .map(f => ({
        id: Math.random().toString(36).substring(7),
        file: f,
        name: f.name,
        previewUrl: URL.createObjectURL(f)
      }))
    
    if (validFiles.length !== newFiles.length) {
      toast.error("Some files were skipped because they are not images.")
    }
    
    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const toastId = toast.loading("Converting images to PDF...")

    try {
      const pdfDoc = await PDFDocument.create()

      for (const img of files) {
        const imageBytes = await img.file.arrayBuffer()
        let embeddedImage
        
        if (img.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes)
        } else if (img.file.type === "image/jpeg" || img.file.type === "image/jpg") {
          embeddedImage = await pdfDoc.embedJpg(imageBytes)
        } else {
          toast.error(`Format ${img.file.type} is not supported directly. Skipping ${img.name}.`, { id: toastId })
          continue
        }

        const imgDims = embeddedImage.scale(1)
        
        if (pageSize === "fit") {
          const page = pdfDoc.addPage([imgDims.width, imgDims.height])
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: imgDims.width,
            height: imgDims.height,
          })
        } else {
          // A4 Size: 595.28 x 841.89 points
          const a4Width = orientation === "portrait" ? 595.28 : 841.89
          const a4Height = orientation === "portrait" ? 841.89 : 595.28
          
          const page = pdfDoc.addPage([a4Width, a4Height])
          
          // Calculate scale to fit within A4 while preserving aspect ratio
          const scale = Math.min(a4Width / imgDims.width, a4Height / imgDims.height)
          const scaledWidth = imgDims.width * scale
          const scaledHeight = imgDims.height * scale
          
          page.drawImage(embeddedImage, {
            x: (a4Width - scaledWidth) / 2,
            y: (a4Height - scaledHeight) / 2,
            width: scaledWidth,
            height: scaledHeight,
          })
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      saveAs(blob, "wow_images.pdf")
      
      toast.success("PDF created successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to create PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl))
    setFiles([])
  }

  const sidebar = (
    <>
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Settings2 size={16} /> Page Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setPageSize("fit")}
            className={`py-2 rounded-lg text-sm transition-colors border ${pageSize === "fit" ? "bg-blue-500/20 border-blue-500/50 text-white" : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"}`}
          >
            Fit Image
          </button>
          <button 
            onClick={() => setPageSize("A4")}
            className={`py-2 rounded-lg text-sm transition-colors border ${pageSize === "A4" ? "bg-blue-500/20 border-blue-500/50 text-white" : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"}`}
          >
            A4 Size
          </button>
        </div>

        {pageSize === "A4" && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button 
              onClick={() => setOrientation("portrait")}
              className={`py-2 rounded-lg text-sm transition-colors border ${orientation === "portrait" ? "bg-purple-500/20 border-purple-500/50 text-white" : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"}`}
            >
              Portrait
            </button>
            <button 
              onClick={() => setOrientation("landscape")}
              className={`py-2 rounded-lg text-sm transition-colors border ${orientation === "landscape" ? "bg-purple-500/20 border-purple-500/50 text-white" : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"}`}
            >
              Landscape
            </button>
          </div>
        )}
      </div>
      
      <div className="h-px bg-white/10 my-2" />

      <button
        onClick={handleConvert}
        disabled={files.length === 0 || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
      >
        {isProcessing ? (
          <span className="animate-pulse">Generating PDF...</span>
        ) : (
          <>
            <Download size={20} />
            Download PDF
          </>
        )}
      </button>

      {files.length > 0 && (
        <button
          onClick={clearAll}
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
      title="Image to PDF"
      description="Convert JPG, PNG, and other images to a single PDF document instantly."
      icon={<ImageIcon size={24} className="text-purple-400" />}
      sidebar={sidebar}
    >
      {files.length === 0 ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
          acceptText="PNG, JPG"
          multiple
        />
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Selected Images</h3>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/70">
              {files.length} image{files.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-3">
              {files.map((file) => (
                <Reorder.Item key={file.id} value={file} className="relative">
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="cursor-grab active:cursor-grabbing p-2 text-white/30 hover:text-white transition-colors">
                      <GripVertical size={20} />
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                      <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{file.name}</p>
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
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                acceptText="Add more images"
                multiple
              />
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
