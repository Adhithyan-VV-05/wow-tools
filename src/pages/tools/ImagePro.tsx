import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { saveAs } from "file-saver"
import { Image as ImageIcon, Download, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function ImagePro() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [filter, setFilter] = useState<'none' | 'grayscale' | 'invert'>('none')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("image-pro")
  })

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    setFileName(file.name)
    const reader = new FileReader()
    reader.addEventListener("load", () => setImage(reader.result as string))
    reader.readAsDataURL(file)
  }

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async () => {
    if (!image || !croppedAreaPixels) return

    setIsProcessing(true)
    const toastId = toast.loading("Processing image...")

    try {
      const img = await createImage(image)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height

      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      )

      // Apply Filters
      if (filter !== 'none') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          if (filter === 'grayscale') {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
            data[i] = avg
            data[i + 1] = avg
            data[i + 2] = avg
          } else if (filter === 'invert') {
            data[i] = 255 - data[i]
            data[i + 1] = 255 - data[i + 1]
            data[i + 2] = 255 - data[i + 2]
          }
        }
        ctx.putImageData(imageData, 0, 0)
      }

      canvas.toBlob((blob) => {
        if (!blob) return
        saveAs(blob, `pro_${fileName}`)
        
        const recordHistory = useAppStore.getState().recordHistory
        recordHistory(`pro_${fileName}`, blob.size, "Image Pro", "/tool/image-pro")
        
        toast.success("Image saved!", { id: toastId })
        setIsProcessing(false)
      }, 'image/jpeg', 0.9)

    } catch (e) {
      console.error(e)
      toast.error("Failed to process image.", { id: toastId })
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Zoom</label>
            <span className="text-xs text-blue-400 font-mono">{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Rotation</label>
            <span className="text-xs text-blue-400 font-mono">{rotation}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={90}
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Filters</label>
          <div className="grid grid-cols-1 gap-2">
            {(['none', 'grayscale', 'invert'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-sm capitalize transition-all ${filter === f ? "bg-blue-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-px bg-white/10 my-6" />

      <button
        onClick={getCroppedImg}
        disabled={!image || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
      >
        <Download size={20} />
        Download Image
      </button>

      {image && (
        <button
          onClick={() => setImage(null)}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
        >
          <Trash2 size={16} />
          Clear
        </button>
      )}
    </>
  )

  return (
    <ToolLayout
      title="Image Pro"
      description="Professional image editing suite: Crop, Rotate, and Apply Filters locally."
      icon={<ImageIcon size={24} className="text-purple-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full">
        {!image ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            acceptText="PNG, JPG, WEBP"
          />
        ) : (
          <div className="relative flex-1 bg-black/40 rounded-2xl overflow-hidden border border-white/10">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-xs text-white/60 border border-white/10 pointer-events-none">
              Drag to crop • Scroll to zoom
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
