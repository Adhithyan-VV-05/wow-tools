import { useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { Image as ImageIcon, Download, Trash2, Search, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

interface ExtractedImage {
  id: string
  url: string
  width: number
  height: number
  page: number
}

export default function ExtractImages() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<ExtractedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("extract-images")
  })

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
    setImages([])
    setProgress(0)
  }

  const extractImages = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    const toastId = toast.loading("Loading PDF...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const foundImages: ExtractedImage[] = []
      
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 100))
        toast.loading(`Scanning page ${i} of ${pdf.numPages}...`, { id: toastId })
        
        const page = await pdf.getPage(i)
        const operatorList = await page.getOperatorList()
        const commonObjs = page.commonObjs
        
        for (let j = 0; j < operatorList.fnArray.length; j++) {
          const fn = operatorList.fnArray[j]
          const args = operatorList.argsArray[j]
          
          if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintInlineImageXObject) {
            const imgName = args[0]
            const imgObj = commonObjs.get(imgName)
            
            if (imgObj && imgObj.data) {
              const canvas = document.createElement("canvas")
              canvas.width = imgObj.width
              canvas.height = imgObj.height
              const ctx = canvas.getContext("2d")
              
              if (ctx) {
                const imageData = ctx.createImageData(imgObj.width, imgObj.height)
                imageData.data.set(imgObj.data)
                ctx.putImageData(imageData, 0, 0)
                
                foundImages.push({
                  id: `${i}-${j}`,
                  url: canvas.toDataURL('image/png'),
                  width: imgObj.width,
                  height: imgObj.height,
                  page: i
                })
              }
            }
          }
        }
      }

      setImages(foundImages)
      
      if (foundImages.length === 0) {
        toast.error("No images found in this PDF.", { id: toastId })
      } else {
        toast.success(`Found ${foundImages.length} images!`, { id: toastId })
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to extract images.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadAll = async () => {
    if (images.length === 0) return
    
    const zip = new JSZip()
    const folder = zip.folder("extracted_images")
    
    images.forEach((img, idx) => {
      const base64Data = img.url.replace(/^data:image\/(png|jpg);base64,/, "")
      folder?.file(`image_${idx + 1}_p${img.page}.png`, base64Data, { base64: true })
    })
    
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, `images_${file?.name.split('.')[0]}.zip`)
    toast.success("Downloaded all images as ZIP")
  }

  const clearAll = () => {
    setFile(null)
    setImages([])
    setProgress(0)
  }

  const sidebar = (
    <>
      <div className="space-y-4">
        {images.length > 0 ? (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Found</div>
            <div className="text-2xl font-bold text-white">{images.length}</div>
            <div className="text-sm text-white/60">Images extracted</div>
          </div>
        ) : (
          <div className="text-sm text-white/40 p-4 bg-white/5 rounded-2xl border border-white/10 italic">
            Scanning for embedded image objects...
          </div>
        )}

        <button
          onClick={images.length > 0 ? downloadAll : extractImages}
          disabled={!file || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-[10px]">{progress}%</span>
            </div>
          ) : images.length > 0 ? (
            <>
              <Download size={20} />
              Download All (ZIP)
            </>
          ) : (
            <>
              <Search size={20} />
              Scan for Images
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
            Start Over
          </button>
        )}
      </div>
    </>
  )

  return (
    <ToolLayout
      title="Extract Images"
      description="Find and download all original images embedded within your PDF document."
      icon={<ImageIcon size={24} className="text-emerald-400" />}
      sidebar={sidebar}
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-blue-500/50 transition-all shadow-xl">
              <img src={img.url} alt="Extracted" className="w-full h-full object-cover p-2" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] text-white/60">Page {img.page} • {img.width}x{img.height}</span>
                <button 
                  onClick={() => saveAs(img.url, `image_${img.id}.png`)}
                  className="p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-400 transition-colors"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col h-full items-center justify-center">
          <div className="p-12 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-6 max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 animate-pulse">
              <Search size={40} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
              <p className="text-white/40 text-sm">
                Click "Scan for Images" to find all embedded assets in this PDF.
              </p>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
