import { useState } from "react"
import { jsPDF } from "jspdf"
import { Download, Trash2, AlignLeft } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function TextToPDF() {
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [fontSize, setFontSize] = useState(12)
  const [fontFamily, setFontFamily] = useState<'helvetica' | 'times' | 'courier'>('helvetica')
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("text-to-pdf")
  })

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    
    try {
      const content = await file.text()
      setText(content)
    } catch (error) {
      toast.error("Failed to read file.")
    }
  }

  const convertToPDF = async () => {
    if (!text) {
      toast.error("Please enter some text.")
      return
    }

    setIsProcessing(true)
    const toastId = toast.loading("Generating PDF...")

    try {
      const doc = new jsPDF()
      doc.setFont(fontFamily)
      doc.setFontSize(fontSize)
      
      const splitText = doc.splitTextToSize(text, 180)
      doc.text(splitText, 15, 20)
      
      doc.save('wow_text.pdf')
      toast.success("PDF generated!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const clearAll = () => {
    setText("")
  }

  const sidebar = (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Font Size</label>
            <span className="text-xs text-blue-400 font-mono">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Font Family</label>
          <div className="grid grid-cols-1 gap-2">
            {(['helvetica', 'times', 'courier'] as const).map(font => (
              <button
                key={font}
                onClick={() => setFontFamily(font)}
                className={`px-3 py-2 rounded-xl text-sm capitalize transition-all ${fontFamily === font ? "bg-blue-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                {font}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/10 my-2" />

        <button
          onClick={convertToPDF}
          disabled={!text || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Download size={20} />
          Export PDF
        </button>

        {text && (
          <button
            onClick={clearAll}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
          >
            <Trash2 size={16} />
            Clear
          </button>
        )}
      </div>
    </>
  )

  return (
    <ToolLayout
      title="Text to PDF"
      description="Convert plain text into clean, printable PDF documents."
      icon={<AlignLeft size={24} className="text-blue-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full gap-4">
        {!text ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'text/plain': ['.txt'] }}
            acceptText="Plain text files (.txt)"
          />
        ) : (
          <div className="flex-1 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing your text here..."
              className="w-full h-full p-6 bg-transparent text-white/80 outline-none resize-none font-mono text-sm leading-relaxed"
              style={{ fontSize: `${fontSize}px`, fontFamily }}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
