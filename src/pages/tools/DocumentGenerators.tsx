import { useState } from "react"
import { jsPDF } from "jspdf"
import { FilePlus, Download, Trash2, User, Receipt, Award, Eye } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import { useAppStore } from "@/store/useAppStore"

export default function DocumentGenerators() {
  const [mode, setMode] = useState<'resume' | 'invoice' | 'certificate'>('resume')
  const [formData, setFormData] = useState<any>({})
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("document-generators")
  })

  const generatePDF = () => {
    const toastId = toast.loading(`Generating ${mode}...`)

    try {
      const doc = new jsPDF()
      
      if (mode === 'resume') {
        doc.setFontSize(24)
        doc.text(formData.name || "Your Name", 20, 30)
        doc.setFontSize(12)
        doc.text(formData.email || "email@example.com", 20, 40)
        doc.line(20, 45, 190, 45)
        doc.setFontSize(14)
        doc.text("Experience", 20, 60)
        doc.setFontSize(10)
        doc.text(formData.experience || "Your work experience details...", 20, 70, { maxWidth: 170 })
      } else if (mode === 'invoice') {
        doc.setFontSize(30)
        doc.text("INVOICE", 140, 30)
        doc.setFontSize(10)
        doc.text(`Invoice #: ${formData.invoiceNum || '1001'}`, 140, 40)
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45)
        
        doc.text("Bill To:", 20, 70)
        doc.text(formData.billTo || "Client Name", 20, 75)
        
        doc.line(20, 90, 190, 90)
        doc.text("Description", 25, 95)
        doc.text("Amount", 170, 95)
        doc.line(20, 97, 190, 97)
        
        doc.text(formData.desc || "Consulting Services", 25, 105)
        doc.text(`$${formData.amount || '0.00'}`, 170, 105)
      } else {
        // Certificate
        doc.rect(10, 10, 190, 277, 'S')
        doc.setFontSize(40)
        doc.text("CERTIFICATE", 105, 60, { align: 'center' })
        doc.setFontSize(16)
        doc.text("This is to certify that", 105, 90, { align: 'center' })
        doc.setFontSize(30)
        doc.text(formData.name || "Recipient Name", 105, 120, { align: 'center' })
        doc.setFontSize(16)
        doc.text("has successfully completed the program.", 105, 150, { align: 'center' })
      }

      doc.save(`${mode}_${Date.now()}.pdf`)
      
      const recordHistory = useAppStore.getState().recordHistory
      recordHistory(`${mode}.pdf`, 1000, "Generator", "/tool/document-generators")
      
      toast.success("PDF generated successfully!", { id: toastId })
    } catch (error) {
      toast.error("Generation failed.", { id: toastId })
    } finally {
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Template</h3>
        <div className="space-y-2">
          <button onClick={() => setMode('resume')} className={`w-full py-2 rounded-xl text-sm transition-all flex items-center gap-2 px-3 ${mode === 'resume' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40"}`}>
            <User size={14} /> Resume Builder
          </button>
          <button onClick={() => setMode('invoice')} className={`w-full py-2 rounded-xl text-sm transition-all flex items-center gap-2 px-3 ${mode === 'invoice' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40"}`}>
            <Receipt size={14} /> Invoice Generator
          </button>
          <button onClick={() => setMode('certificate')} className={`w-full py-2 rounded-xl text-sm transition-all flex items-center gap-2 px-3 ${mode === 'certificate' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40"}`}>
            <Award size={14} /> Certificate
          </button>
        </div>
      </div>

      <button
        onClick={generatePDF}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
      >
        <Download size={20} /> Download PDF
      </button>

      <button
        onClick={() => setFormData({})}
        className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
      >
        <Trash2 size={16} /> Reset Form
      </button>
    </div>
  )

  return (
    <ToolLayout
      title="Professional Generators"
      description="Instantly create professional resumes, invoices, and certificates with local browser-native rendering."
      icon={<FilePlus size={24} className="text-blue-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full bg-black/40 rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
            {mode === 'resume' ? "R" : mode === 'invoice' ? "I" : "C"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white capitalize">{mode} Details</h3>
            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Local Rendering Mode</p>
          </div>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {mode === 'resume' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
                <input type="email" placeholder="Email Address" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
              </div>
              <textarea placeholder="Experience Summary" value={formData.experience || ""} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none" />
            </>
          )}
          {mode === 'invoice' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Invoice Number" value={formData.invoiceNum || ""} onChange={e => setFormData({...formData, invoiceNum: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
                <input type="text" placeholder="Bill To (Client)" value={formData.billTo || ""} onChange={e => setFormData({...formData, billTo: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Service Description" value={formData.desc || ""} onChange={e => setFormData({...formData, desc: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
                <input type="number" placeholder="Amount ($)" value={formData.amount || ""} onChange={e => setFormData({...formData, amount: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
              </div>
            </>
          )}
          {mode === 'certificate' && (
            <>
              <input type="text" placeholder="Recipient Full Name" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
              <input type="text" placeholder="Program Name" value={formData.program || ""} onChange={e => setFormData({...formData, program: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
            </>
          )}
        </div>
        
        <div className="p-4 bg-blue-500/5 border-t border-white/5 flex items-center gap-3">
          <Eye size={16} className="text-blue-400" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Real-time Preview Not Available - Export to view PDF</span>
        </div>
      </div>
    </ToolLayout>
  )
}
