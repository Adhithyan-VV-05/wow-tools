
import { ChevronLeft, Info, ShieldCheck, CheckCircle2, AlertTriangle, Settings2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getToolInfo } from "@/constants/toolInfo"

interface ToolLayoutProps {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
  sidebar?: React.ReactNode
  secondarySidebar?: React.ReactNode
  toolId?: string
}

export default function ToolLayout({ title, description, icon, children, sidebar, secondarySidebar, toolId }: ToolLayoutProps) {
  const [showInfo, setShowInfo] = useState(false)
  const info = toolId ? getToolInfo(toolId) : null

  // Close drawers when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start">
        <Link to="/tools" className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors mb-4">
          <ChevronLeft size={16} />
          Back to Tools
        </Link>
        
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
                {info && (
                  <div className="relative">
                    <button 
                      onMouseEnter={() => setShowInfo(true)}
                      onMouseLeave={() => setShowInfo(false)}
                      onClick={() => setShowInfo(!showInfo)}
                      className={`p-1.5 rounded-full transition-all ${showInfo ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-white/30 hover:text-white hover:bg-white/10'}`}
                    >
                      <Info size={18} />
                    </button>

                    <AnimatePresence>
                      {showInfo && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute left-0 top-full mt-4 z-[100] w-80 p-6 glass-panel rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl"
                        >
                          <div className="flex items-center gap-2 mb-4 text-blue-400">
                            <ShieldCheck size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">How it works</span>
                          </div>
                          <p className="text-sm text-white/70 leading-relaxed mb-6">
                            {info.howItWorks}
                          </p>

                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                <CheckCircle2 size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Supported</span>
                              </div>
                              <ul className="grid grid-cols-1 gap-1">
                                {info.supported.map((s, i) => (
                                  <li key={i} className="text-[11px] text-white/50 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-white/20" /> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-2 text-amber-400">
                                <AlertTriangle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Warnings</span>
                              </div>
                              <ul className="grid grid-cols-1 gap-1">
                                {info.warnings.map((w, i) => (
                                  <li key={i} className="text-[11px] text-white/50 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-white/20" /> {w}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-white/5">
                            <p className="text-[9px] text-white/30 text-center uppercase tracking-tighter">
                              Secure Local Processing • No Cloud Uploads
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <p className="text-white/50">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebars & Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pt-4 lg:pt-16 gap-6 lg:gap-6">
        
        {/* Page Thumbnails (Left Sidebar / Top on Mobile) */}
        {secondarySidebar && (
          <div className="w-full lg:w-32 border-b lg:border-r border-white/5 bg-black/20 flex flex-col">
            <div className="p-3 lg:p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Pages</span>
            </div>
            <div className="flex-1 overflow-x-auto lg:overflow-y-auto p-3 lg:p-4 custom-scrollbar flex flex-row lg:flex-col gap-3 lg:gap-4 items-center">
              {secondarySidebar}
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <main className="flex-1 relative overflow-hidden flex flex-col min-w-0 min-h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar glass-panel rounded-3xl">
            {children}
          </div>
        </main>

        {/* Options Sidebar (Right Sidebar / Bottom on Mobile) */}
        {sidebar && (
          <div className="w-full lg:w-80 flex-shrink-0 glass-panel rounded-3xl p-6 flex flex-col gap-6 lg:mt-0 mt-6">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4 flex items-center gap-2">
              <Settings2 size={18} className="text-blue-400" />
              Options
            </h3>
            <div className="flex-1 flex flex-col gap-4">
              {sidebar}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
