import { useState, useRef } from "react"
import { jsPDF } from "jspdf"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-css"
import "prismjs/components/prism-json"
import { Code, Download, Trash2, Edit3, Eye, FileCode } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'css', name: 'CSS' },
  { id: 'json', name: 'JSON' },
  { id: 'markup', name: 'HTML/Markup' },
]

export default function CodeToPDF() {
  const [code, setCode] = useState("")
  const [lang, setLang] = useState("javascript")
  const [isProcessing, setIsProcessing] = useState(false)
  const [view, setView] = useState<'edit' | 'preview'>('edit')
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("code-to-pdf")
  })

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    try {
      const text = await file.text()
      setCode(text)
      setView('edit')
      // Simple extension detection
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext === 'ts' || ext === 'tsx') setLang('typescript')
      else if (ext === 'js' || ext === 'jsx') setLang('javascript')
      else if (ext === 'py') setLang('python')
      else if (ext === 'json') setLang('json')
      else if (ext === 'html') setLang('markup')
    } catch (error) {
      toast.error("Failed to read file.")
    }
  }

  const convertToPDF = async () => {
    if (!code) return

    setIsProcessing(true)
    const toastId = toast.loading("Generating code PDF...")

    try {
      const doc = new jsPDF()
      doc.setFont("courier")
      doc.setFontSize(10)
      
      const lines = code.split('\n')
      let y = 20
      const margin = 15
      const pageHeight = doc.internal.pageSize.height
      
      doc.text(`File: ${lang.toUpperCase()} Source Code`, margin, 10)
      doc.line(margin, 12, 195, 12)

      lines.forEach((line) => {
        if (y > pageHeight - 20) {
          doc.addPage()
          y = 20
        }
        // Basic wrapping for long lines
        const splitLine = doc.splitTextToSize(line, 180)
        doc.text(splitLine, margin, y)
        y += 5 * splitLine.length
      })

      doc.save(`code_${lang}.pdf`)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`code_${lang}.pdf`, code.length, "Code to PDF", "/tool/code-to-pdf")
      
      toast.success("PDF generated!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Language</label>
          <select 
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
          >
            {LANGUAGES.map(l => (
              <option key={l.id} value={l.id} className="bg-[#16171d]">{l.name}</option>
            ))}
          </select>
        </div>

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
            <Eye size={14} /> Highlight
          </button>
        </div>

        <button
          onClick={convertToPDF}
          disabled={!code || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Download size={20} />
          Export PDF
        </button>

        {code && (
          <button
            onClick={() => setCode("")}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10"
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
      title="Code to PDF"
      description="Convert your source code into beautifully formatted PDF documents."
      icon={<FileCode size={24} className="text-blue-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full gap-4">
        {!code && view === 'edit' ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'text/*': ['.js', '.ts', '.py', '.css', '.json', '.html'] }}
            acceptText="Source code files"
          />
        ) : (
          <div className="flex-1 rounded-2xl overflow-hidden bg-[#1e1e1e] border border-white/10 flex flex-col">
            {view === 'edit' ? (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste your code here..."
                className="w-full h-full p-6 bg-transparent text-white/80 outline-none resize-none font-mono text-sm leading-relaxed"
              />
            ) : (
              <pre className="w-full h-full p-6 overflow-auto font-mono text-sm leading-relaxed">
                <code 
                  className={`language-${lang}`}
                  dangerouslySetInnerHTML={{ 
                    __html: Prism.highlight(code, Prism.languages[lang] || Prism.languages.javascript, lang) 
                  }}
                />
              </pre>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
