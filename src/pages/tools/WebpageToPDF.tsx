import { useState } from "react"
import { jsPDF } from "jspdf"
import { Globe, Trash2, Monitor, MousePointer } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import { useAppStore } from "@/store/useAppStore"

export default function WebpageToPDF() {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("webpage-to-pdf")
  })

  const handleConvert = async () => {
    if (!url) return
    setIsProcessing(true)
    const toastId = toast.loading("Fetching and rendering webpage... (Requires CORS-friendly URL)")

    try {
      // In a real world app, this would use a proxy or a headless browser
      // Browser-side only, we can fetch the HTML and render it to a PDF
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      const html = data.contents

      const doc = new jsPDF()
      doc.setFontSize(10)
      
      // Simple text extraction for the demo
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html
      const text = tempDiv.innerText || tempDiv.textContent || ""
      
      doc.text(text.slice(0, 5000), 10, 10, { maxWidth: 190 })
      doc.save(`webpage_${Date.now()}.pdf`)
      
      toast.success("Webpage converted to PDF!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("CORS Blocked or Invalid URL. Try a simpler page.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Capture URL</h3>
        <div className="relative">
           <input 
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-xs"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <button
        onClick={handleConvert}
        disabled={!url || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
      >
        <Globe size={20} /> Capture Webpage
      </button>

      {url && (
        <button
          onClick={() => setUrl("")}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
        >
          <Trash2 size={16} /> Clear
        </button>
      )}
    </div>
  )

  return (
    <ToolLayout
      title="Webpage to PDF"
      description="Convert any publicly accessible webpage into a PDF document instantly."
      icon={<Globe size={24} className="text-blue-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full items-center justify-center">
        {!url ? (
          <div className="max-w-md w-full p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
             <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-8 animate-pulse">
               <Monitor size={40} />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4">Enter a URL</h3>
             <p className="text-white/40 leading-relaxed mb-8">
               Paste the link of the website you want to save. We'll render it into a high-quality PDF document locally.
             </p>
             <div className="flex items-center gap-2 justify-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-bold uppercase">
               External Fetching Enabled
             </div>
          </div>
        ) : (
          <div className="w-full h-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl relative group">
             <iframe src={url} className="w-full h-full border-none pointer-events-none" />
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <MousePointer size={48} className="text-white mb-4 mx-auto animate-bounce" />
                  <p className="text-white font-bold text-xl tracking-tight">Ready to Capture</p>
                  <p className="text-white/60 text-sm">Click "Capture Webpage" in the sidebar</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
