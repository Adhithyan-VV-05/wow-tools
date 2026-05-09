import { useState, useMemo, useEffect } from "react"
import { Search, FileText, Download, Trash2, Highlighter, ArrowRight, Copy } from "lucide-react"
import { setupPdfWorker, pdfjsLib } from "@/lib/pdfWorker"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function KeywordFinder() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useEffect(() => {
    addRecentTool("keyword-finder")
    setupPdfWorker()
  }, [addRecentTool])

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    setFile(selectedFile)
    setIsProcessing(true)
    const toastId = toast.loading("Extracting text for searching...")

    try {
      let text = ""
      if (selectedFile.type === "application/pdf") {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items.map((item: any) => item.str).join(" ")
          text += pageText + "\n\n"
        }
      } else {
        text = await selectedFile.text()
      }
      
      setExtractedText(text)
      toast.success("Text extracted!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to extract text.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{part}</mark> 
            : part
        )}
      </>
    )
  }

  const occurrences = useMemo(() => {
    if (!searchQuery || !extractedText) return 0
    const matches = extractedText.match(new RegExp(searchQuery, 'gi'))
    return matches ? matches.length : 0
  }, [searchQuery, extractedText])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText)
    toast.success("All text copied to clipboard!")
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Search Keyword</label>
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white outline-none focus:border-blue-500 transition-all"
            placeholder="Type to find..."
          />
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
        </div>
        {searchQuery && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-white/40">Found:</span>
            <span className="text-sm font-bold text-blue-400">{occurrences} occurrences</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={copyToClipboard}
          disabled={!extractedText}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10"
        >
          <Copy size={16} /> Copy All Text
        </button>

        {file && (
          <button
            onClick={() => { setFile(null); setExtractedText(""); setSearchQuery("") }}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10"
          >
            <Trash2 size={16} /> Clear Document
          </button>
        )}
      </div>
    </div>
  )

  return (
    <ToolLayout
      title="Keyword Finder"
      description="Search and highlight keywords across your PDF and text documents locally."
      icon={<Search size={24} className="text-blue-400" />}
      sidebar={sidebar}
      toolId="keyword-finder"
    >
      <div className="flex flex-col h-full">
        {!file ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'application/pdf': ['.pdf'], 'text/*': ['.txt', '.md', '.json'] }}
            acceptText="PDF or Text files"
          />
        ) : (
          <div className="flex-1 flex flex-col bg-black/40 rounded-3xl border border-white/10 overflow-hidden">
             <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-2 text-white/70">
                 <FileText size={18} className="text-blue-400" />
                 <span className="text-sm font-medium">{file.name}</span>
               </div>
               <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase">
                 Indexed Locally
               </div>
             </div>
             <div className="flex-1 p-8 overflow-auto font-mono text-sm leading-relaxed text-white/60 whitespace-pre-wrap selection:bg-blue-500/30">
               {highlightText(extractedText, searchQuery)}
             </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
