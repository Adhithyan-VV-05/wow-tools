import { useState, useRef } from "react"
import { jsPDF } from "jspdf"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { FileText, Download, Trash2, Edit3, Eye, FileType } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function MarkdownToPDF() {
  const [markdown, setMarkdown] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [view, setView] = useState<'edit' | 'preview'>('edit')
  const previewRef = useRef<HTMLDivElement>(null)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("markdown-to-pdf")
  })

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    
    try {
      const text = await file.text()
      setMarkdown(text)
      setView('edit')
    } catch (error) {
      toast.error("Failed to read file.")
    }
  }

  const convertToPDF = async () => {
    if (!markdown) {
      toast.error("Please enter some markdown content.")
      return
    }

    setIsProcessing(true)
    const toastId = toast.loading("Generating PDF...")

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      })

      // We use a hidden container to render the HTML before capturing it
      const container = document.createElement('div')
      container.style.width = '190mm' // A4 width minus margins
      container.style.padding = '20mm'
      container.style.color = '#000000'
      container.style.backgroundColor = '#ffffff'
      container.style.position = 'absolute'
      container.style.left = '-10000px'
      
      const htmlContent = await marked(markdown)
      container.innerHTML = DOMPurify.sanitize(htmlContent as string)
      document.body.appendChild(container)

      await doc.html(container, {
        callback: function (doc) {
          doc.save('wow_markdown.pdf')
          document.body.removeChild(container)
          toast.success("PDF generated!", { id: toastId })
          setIsProcessing(false)
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF.", { id: toastId })
      setIsProcessing(false)
    }
  }

  const clearAll = () => {
    setMarkdown("")
  }

  const sidebar = (
    <>
      <div className="space-y-4">
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setView('edit')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${view === 'edit' ? "bg-blue-500 text-white" : "text-white/50 hover:text-white"}`}
          >
            <Edit3 size={14} /> Editor
          </button>
          <button
            onClick={() => setView('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${view === 'preview' ? "bg-blue-500 text-white" : "text-white/50 hover:text-white"}`}
          >
            <Eye size={14} /> Preview
          </button>
        </div>

        <button
          onClick={convertToPDF}
          disabled={!markdown || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Download size={20} />
          Export PDF
        </button>

        {markdown && (
          <button
            onClick={clearAll}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
          >
            <Trash2 size={16} />
            Clear Editor
          </button>
        )}
      </div>
    </>
  )

  return (
    <ToolLayout
      title="Markdown to PDF"
      description="Convert your Markdown documents into professional PDFs locally."
      icon={<FileType size={24} className="text-orange-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full gap-4">
        {!markdown && view === 'edit' ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'text/markdown': ['.md', '.markdown', '.txt'] }}
            acceptText="Markdown files (.md, .txt)"
          />
        ) : (
          <div className="flex-1 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex flex-col">
            {view === 'edit' ? (
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="# Start typing your markdown here..."
                className="w-full h-full p-6 bg-transparent text-white/80 outline-none resize-none font-mono text-sm leading-relaxed"
              />
            ) : (
              <div 
                className="w-full h-full p-8 overflow-y-auto bg-white text-black prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(marked.parse(markdown) as string) 
                }}
              />
            )}
          </div>
        )}
        
        {markdown && (
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-white/30 font-mono">
              {markdown.length} characters • {markdown.split('\n').length} lines
            </span>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-widest border border-blue-500/20">
                Local Processing
              </span>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
