
import { ChevronLeft, Info, X, ShieldCheck, CheckCircle2, AlertTriangle, Menu, Settings2, Grid2X2 } from "lucide-react"
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
  const [showMobileOptions, setShowMobileOptions] = useState(false)
  const [showMobileThumbnails, setShowMobileThumbnails] = useState(false)
  const info = toolId ? getToolInfo(toolId) : null

  // Close drawers when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowMobileOptions(false)
        setShowMobileThumbnails(false)
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
      <div className="flex-1 flex overflow-hidden pt-4 md:pt-16 gap-0 lg:gap-6">
        {/* PC: Page Thumbnails (Left Sidebar) */}
        <AnimatePresence>
          {secondarySidebar && (
            <motion.div
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
              className="w-32 border-r border-white/5 bg-black/20 flex flex-col hidden lg:flex"
            >
              <div className="p-4 border-b border-white/5">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Pages</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4 items-center">
                {secondarySidebar}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace */}
        <main className="flex-1 relative overflow-hidden flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-2 md:p-8 custom-scrollbar glass-panel rounded-3xl">
            {children}
          </div>

          {/* Mobile Floating Action Buttons */}
          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex gap-3">
            {secondarySidebar && (
              <button 
                onClick={() => setShowMobileThumbnails(true)}
                className="p-4 rounded-2xl bg-blue-600 text-white shadow-2xl flex items-center gap-2 font-bold text-sm"
              >
                <Grid2X2 size={20} />
                <span className="hidden sm:inline">Pages</span>
              </button>
            )}
            {sidebar && (
              <button 
                onClick={() => setShowMobileOptions(true)}
                className="p-4 rounded-2xl bg-white text-black shadow-2xl flex items-center gap-2 font-bold text-sm"
              >
                <Settings2 size={20} />
                <span className="hidden sm:inline">Options</span>
              </button>
            )}
          </div>
        </main>

        {/* PC: Options Sidebar */}
        {sidebar && (
          <div className="hidden lg:flex w-80 flex-shrink-0 glass-panel rounded-3xl p-6 flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4">Options</h3>
            <div className="flex-1 flex flex-col gap-4">
              {sidebar}
            </div>
          </div>
        )}

        {/* Mobile: Thumbnails Drawer */}
        <AnimatePresence>
          {showMobileThumbnails && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileThumbnails(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                className="fixed inset-y-0 left-0 w-[70%] max-w-[280px] bg-[#0a0a0b] border-r border-white/10 z-[160] lg:hidden flex flex-col p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white">Pages</h3>
                  <button onClick={() => setShowMobileThumbnails(false)} className="p-2 text-white/50"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 items-center">
                  {secondarySidebar}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile: Options Drawer */}
        <AnimatePresence>
          {showMobileOptions && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileOptions(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] lg:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="fixed inset-x-0 bottom-0 h-[80%] bg-[#0a0a0b] border-t border-white/10 z-[160] lg:hidden flex flex-col p-8 shadow-2xl rounded-t-[3rem]"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">Tool Options</h3>
                  <button onClick={() => setShowMobileOptions(false)} className="p-2 text-white/50"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {sidebar}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
