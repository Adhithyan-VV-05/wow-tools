import { useState, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { jsPDF } from "jspdf"
import { Camera, Download, Trash2, Zap, Image as ImageIcon, Check, X, CameraOff } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import { useAppStore } from "@/store/useAppStore"

export default function ScanToPDF() {
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const webcamRef = useRef<Webcam>(null)
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("scan-to-pdf")
  })

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImages(prev => [...prev, imageSrc])
      toast.success("Page captured!")
    }
  }, [webcamRef])

  const exportPDF = async () => {
    if (capturedImages.length === 0) return
    setIsProcessing(true)
    const toastId = toast.loading("Generating scanned PDF...")

    try {
      const pdf = new jsPDF()
      capturedImages.forEach((img, i) => {
        if (i > 0) pdf.addPage()
        const width = pdf.internal.pageSize.getWidth()
        const height = pdf.internal.pageSize.getHeight()
        pdf.addImage(img, 'JPEG', 0, 0, width, height)
      })

      pdf.save(`scanned_document_${Date.now()}.pdf`)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`scanned_document.pdf`, capturedImages.length * 500000, "Scan to PDF", "/tool/scan-to-pdf")
      
      toast.success("PDF generated!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Scan Status</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-white/50">Pages Captured</span>
          <span className="text-lg font-bold text-blue-400">{capturedImages.length}</span>
        </div>
        <div className="flex gap-2">
          {!isCameraOpen ? (
            <button 
              onClick={() => setIsCameraOpen(true)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Camera size={14} /> Open Camera
            </button>
          ) : (
            <button 
              onClick={() => setIsCameraOpen(false)}
              className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <CameraOff size={14} /> Close Camera
            </button>
          )}
        </div>
      </div>

      <button
        onClick={exportPDF}
        disabled={capturedImages.length === 0 || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
      >
        <Download size={20} />
        Save as PDF
      </button>

      {capturedImages.length > 0 && (
        <button
          onClick={() => setCapturedImages([])}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
        >
          <Trash2 size={16} /> Clear All
        </button>
      )}
    </div>
  )

  return (
    <ToolLayout
      title="Scan to PDF"
      description="Turn your device camera into a portable document scanner and export directly to PDF."
      icon={<Camera size={24} className="text-blue-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full gap-6">
        <div className="flex-1 relative bg-black rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center">
          {isCameraOpen ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                onUserMediaError={() => {
                  setIsCameraOpen(false)
                  toast.error("Camera access denied or unavailable.")
                }}
              />
              <button 
                onClick={capture}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-blue-500 shadow-2xl flex items-center justify-center text-blue-600 hover:scale-110 active:scale-95 transition-all"
              >
                <Camera size={32} />
              </button>
            </>
          ) : (
            <div className="text-center p-12">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mx-auto mb-6">
                 <CameraOff size={40} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Camera is Closed</h3>
               <p className="text-sm text-white/40 max-w-xs">Grant camera permissions and click "Open Camera" to start scanning documents.</p>
            </div>
          )}
        </div>

        {capturedImages.length > 0 && (
          <div className="h-40 overflow-x-auto pb-2 -mb-2">
            <div className="flex gap-4 h-full">
              {capturedImages.map((img, i) => (
                <div key={i} className="h-full aspect-[1/1.4] bg-white rounded-lg overflow-hidden flex-shrink-0 relative group shadow-xl">
                  <img src={img} alt={`Page ${i+1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => setCapturedImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="p-2 bg-red-600 text-white rounded-lg shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
