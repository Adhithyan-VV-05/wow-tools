import { useState } from "react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { Info, Download, Trash2, ShieldCheck, FileText, Calendar, User, Tag, Edit3 } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

interface Metadata {
  title?: string
  author?: string
  subject?: string
  creator?: string
  keywords?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
}

export default function PDFMetadata() {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<Metadata>({})
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("pdf-metadata")
  })

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
    const arrayBuffer = await selectedFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    
    setMetadata({
      title: pdfDoc.getTitle() || "",
      author: pdfDoc.getAuthor() || "",
      subject: pdfDoc.getSubject() || "",
      creator: pdfDoc.getCreator() || "",
      keywords: pdfDoc.getKeywords() || "",
      producer: pdfDoc.getProducer() || "",
      creationDate: pdfDoc.getCreationDate(),
      modificationDate: pdfDoc.getModificationDate()
    })
  }

  const handleUpdate = (field: keyof Metadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }

  const cleanMetadata = () => {
    setMetadata({
      title: "",
      author: "",
      subject: "",
      creator: "wow-tools (wow-tools.app)",
      keywords: "",
      producer: "wow-tools PDF Engine"
    })
    toast.success("Metadata cleared!")
  }

  const savePDF = async () => {
    if (!file) return

    setIsProcessing(true)
    const toastId = toast.loading("Saving PDF with new metadata...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      pdfDoc.setTitle(metadata.title || "")
      pdfDoc.setAuthor(metadata.author || "")
      pdfDoc.setSubject(metadata.subject || "")
      pdfDoc.setCreator(metadata.creator || "")
      pdfDoc.setKeywords(metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()) : [])
      pdfDoc.setProducer(metadata.producer || "")

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      saveAs(blob, `metadata_updated_${file.name}`)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`metadata_updated_${file.name}`, blob.size, "Metadata Editor", "/tool/pdf-metadata")
      
      toast.success("PDF saved successfully!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to update metadata.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <>
      <div className="space-y-4">
        <button
          onClick={cleanMetadata}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
        >
          <Trash2 size={16} />
          Clean All Metadata
        </button>

        <button
          onClick={savePDF}
          disabled={!file || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Download size={20} />
          Save PDF
        </button>
      </div>
    </>
  )

  const MetadataField = ({ icon: Icon, label, value, field }: { icon: any, label: string, value: string, field: keyof Metadata }) => (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/40 uppercase tracking-widest flex items-center gap-2">
        <Icon size={12} /> {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleUpdate(field, e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  )

  return (
    <ToolLayout
      title="Metadata Editor"
      description="View, edit, or strip metadata from your PDF files for better privacy."
      icon={<Info size={24} className="text-emerald-400" />}
      sidebar={sidebar}
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : (
        <div className="max-w-3xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetadataField icon={FileText} label="Title" value={metadata.title || ""} field="title" />
            <MetadataField icon={User} label="Author" value={metadata.author || ""} field="author" />
            <MetadataField icon={Tag} label="Subject" value={metadata.subject || ""} field="subject" />
            <MetadataField icon={Edit3} label="Keywords" value={metadata.keywords || ""} field="keywords" />
            <MetadataField icon={ShieldCheck} label="Creator" value={metadata.creator || ""} field="creator" />
            <MetadataField icon={ShieldCheck} label="Producer" value={metadata.producer || ""} field="producer" />
            
            <div className="md:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-white/20" size={20} />
                <div>
                  <div className="text-[10px] text-white/30 uppercase font-bold">Created</div>
                  <div className="text-sm text-white/60">{metadata.creationDate?.toLocaleString() || "Unknown"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-white/20" size={20} />
                <div>
                  <div className="text-[10px] text-white/30 uppercase font-bold">Modified</div>
                  <div className="text-sm text-white/60">{metadata.modificationDate?.toLocaleString() || "Unknown"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
