import { useState, useEffect } from "react"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { Download, Trash2, Image as ImageIcon } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"
import { setupPdfWorker, pdfjsLib } from "@/lib/pdfWorker"

interface ConvertedImage {
  index: number
  url: string
}

export default function PDFToImage() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<ConvertedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [format, setFormat] = useState<"image/jpeg" | "image/png">("image/jpeg")
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useEffect(() => {
    addRecentTool("pdf-to-image")
    setupPdfWorker()
  }, [addRecentTool])

  const handleFileSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
    setIsLoading(true)
    setImages([])

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      
      const convertedImages: ConvertedImage[] = []
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        // Use a higher scale for better image quality (e.g., 2.0 or 3.0)
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({
          canvasContext: ctx!,
          viewport: viewport
        } as any).promise
        
        convertedImages.push({
          index: i,
          url: canvas.toDataURL(format, 0.9) // 90% quality for jpeg
        })
      }
      
      setImages(convertedImages)
    } catch (error) {
      console.error(error)
      toast.error("Failed to read PDF file.")
      setFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadAll = async () => {
    if (images.length === 0 || !file) return

    setIsProcessing(true)
    const toastId = toast.loading("Zipping images...")

    try {
      if (images.length === 1) {
        // Just download the single image
        saveAs(images[0].url, `${file.name.replace('.pdf', '')}_page_1.${format === 'image/jpeg' ? 'jpg' : 'png'}`)
      } else {
        // Create a zip file
        const zip = new JSZip()
        const ext = format === 'image/jpeg' ? 'jpg' : 'png'
        
        for (const img of images) {
          const response = await fetch(img.url)
          const blob = await response.blob()
          zip.file(`page_${img.index}.${ext}`, blob)
        }
        
        const zipBlob = await zip.generateAsync({ type: "blob" })
        saveAs(zipBlob, `${file.name.replace('.pdf', '')}_images.zip`)
      }
      toast.success("Downloaded successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to download images.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadSingle = (img: ConvertedImage) => {
    saveAs(img.url, `${file?.name.replace('.pdf', '') || 'document'}_page_${img.index}.${format === 'image/jpeg' ? 'jpg' : 'png'}`)
  }

  const clearAll = () => {
    setFile(null)
    setImages([])
  }

  const sidebar = (
    <>
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-white">Image Format</label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setFormat("image/jpeg")}
            disabled={isLoading || file !== null}
            className={`py-2 rounded-lg text-sm transition-colors border ${format === "image/jpeg" ? "bg-blue-500/20 border-blue-500/50 text-white" : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            JPG
          </button>
          <button 
            onClick={() => setFormat("image/png")}
            disabled={isLoading || file !== null}
            className={`py-2 rounded-lg text-sm transition-colors border ${format === "image/png" ? "bg-purple-500/20 border-purple-500/50 text-white" : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            PNG
          </button>
        </div>
        <p className="text-xs text-white/40">
          Format must be selected before uploading the PDF.
        </p>
      </div>
      
      <div className="h-px bg-white/10 my-2" />

      <button
        onClick={handleDownloadAll}
        disabled={images.length === 0 || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
      >
        {isProcessing ? (
          <span className="animate-pulse">Zipping...</span>
        ) : (
          <>
            <Download size={20} />
            Download All ({images.length})
          </>
        )}
      </button>

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
      title="PDF to Image"
      description="Convert every page of a PDF into high-quality JPG or PNG images."
      icon={<ImageIcon size={24} className="text-purple-400" />}
      sidebar={sidebar}
      toolId="pdf-to-image"
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFileSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/50">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p>Converting pages to images...</p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white truncate max-w-[70%]">{file.name}</h3>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/70">
              {images.length} pages
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img) => (
                <div 
                  key={img.index} 
                  className="relative group bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                >
                  <div className="aspect-[1/1.4] w-full bg-white flex items-center justify-center p-2">
                    <img src={img.url} alt={`Page ${img.index}`} className="w-full h-full object-contain" />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => downloadSingle(img)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-400 transition-colors shadow-xl"
                    >
                      <Download size={16} /> Download
                    </button>
                  </div>
                  
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white shadow-md border border-white/10">
                    Page {img.index}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
