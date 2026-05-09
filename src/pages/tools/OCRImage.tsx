import { useState, useCallback } from "react"
import { createWorker } from "tesseract.js"
import { FileText, Copy, Download, Trash2, Languages, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

const LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'hin', name: 'Hindi' },
  { code: 'mal', name: 'Malayalam' },
  { code: 'ara', name: 'Arabic' },
  { code: 'jpn', name: 'Japanese' },
]

export default function OCRImage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedLang, setSelectedLang] = useState('eng')
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("ocr-image")
  })

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file.")
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setExtractedText("")
    setProgress(0)
  }

  const runOCR = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    const toastId = toast.loading("Initializing OCR engine...")

    try {
      const worker = await createWorker(selectedLang, 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        }
      });

      toast.loading("Extracting text...", { id: toastId })
      const { data: { text } } = await worker.recognize(file);
      setExtractedText(text)
      await worker.terminate();
      
      toast.success("Text extracted successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to extract text from image.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText)
    toast.success("Text copied to clipboard")
  }

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `extracted_text_${file?.name.split('.')[0] || 'ocr'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setExtractedText("")
    setProgress(0)
  }

  const sidebar = (
    <>
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Languages size={16} /> Language
        </label>
        <select 
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={isProcessing}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-[#16171d]">
              {lang.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-white/40">
          Select the language of the text in your image for better accuracy.
        </p>
      </div>
      
      <div className="h-px bg-white/10 my-2" />

      {extractedText ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={copyToClipboard}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all bg-white/10 hover:bg-white/20 text-white border border-white/10"
          >
            <Copy size={16} />
            Copy Text
          </button>
          <button
            onClick={downloadText}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <Download size={16} />
            Download .txt
          </button>
        </div>
      ) : (
        <button
          onClick={runOCR}
          disabled={!file || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-[10px]">{progress}%</span>
            </div>
          ) : (
            <>
              <FileText size={20} />
              Extract Text
            </>
          )}
        </button>
      )}

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
      title="OCR Image"
      description="Extract text from images using high-accuracy local OCR processing."
      icon={<FileText size={24} className="text-emerald-400" />}
      sidebar={sidebar}
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
          acceptText="PNG, JPG, WEBP"
        />
      ) : (
        <div className="flex flex-col md:flex-row h-full gap-6">
          {/* Image Preview */}
          <div className="flex-1 flex flex-col min-w-0">
            <h4 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">Source Image</h4>
            <div className="flex-1 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center p-4">
              {previewUrl && <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />}
            </div>
          </div>

          {/* Extracted Text */}
          <div className="flex-1 flex flex-col min-w-0">
            <h4 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">Extracted Text</h4>
            <div className="flex-1 rounded-2xl overflow-hidden bg-black/40 border border-white/10 p-4 relative group">
              {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm z-10">
                  <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-blue-400 font-mono text-sm animate-pulse">Processing... {progress}%</span>
                </div>
              ) : extractedText ? (
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full h-full bg-transparent border-none outline-none text-white/80 resize-none font-mono text-sm leading-relaxed"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                  <FileText size={48} className="mb-4 opacity-10" />
                  <p>Click "Extract Text" to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
