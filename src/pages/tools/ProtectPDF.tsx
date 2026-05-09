import { useState } from "react"
import { Lock } from "lucide-react"
import ToolLayout from "@/components/tools/ToolLayout"
import { useAppStore } from "@/store/useAppStore"

export default function ProtectPDF() {
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("protect-pdf")
  })

  return (
    <ToolLayout
      title="Protect PDF"
      description="Secure your PDF files with a password (coming soon locally)."
      icon={<Lock size={24} className="text-blue-400" />}
    >
      <div className="flex flex-col h-full items-center justify-center">
        <div className="max-w-md w-full p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-8 animate-pulse">
            <Lock size={40} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Coming Soon</h3>
          <p className="text-white/40 leading-relaxed">
            Local-first PDF encryption is under development to ensure maximum security without server processing.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
