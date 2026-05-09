import { Link } from "react-router-dom"
import { Search, Settings, Menu, X, ChevronDown, ChevronRight, Grid } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { TOOL_CATEGORIES } from "@/constants/tools"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const openSearch = useAppStore((state) => state.search.open)
  const [titleIndex, setTitleIndex] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null)
  const titles = ["WOW-Tools", "Work On Web"]

  useEffect(() => {
    const timer = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titles.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <div className="pointer-events-auto glass rounded-full px-6 py-3 flex items-center justify-between w-full w-[100%] shadow-2xl transition-all duration-300">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xs group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.3)] uppercase">
            WOW
          </div>
          <div className="flex flex-col h-6 overflow-hidden relative w-32">
            <AnimatePresence mode="wait">
              <motion.span
                key={titleIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="font-bold text-lg tracking-tight text-white group-hover:text-glow absolute inset-0"
              >
                {titles[titleIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setShowMegaMenu(true)}
            onMouseLeave={() => setShowMegaMenu(false)}
          >
            <button className={`flex items-center gap-2 hover:text-white transition-colors py-2 px-4 rounded-full ${showMegaMenu ? 'bg-white/10 text-white' : ''}`}>
              <Grid size={16} />
              Tools
              <span className="bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
                50+
              </span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showMegaMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Menu (Desktop) */}
            <AnimatePresence>
              {showMegaMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as const }}
                  className="fixed top-20 inset-x-4 md:inset-x-10 lg:inset-x-20 mt-4 pointer-events-auto z-[60]"
                >
                  <div className="bg-[#0f1015] rounded-[3rem] p-12 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-y-16 gap-x-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-white/10 overflow-y-auto max-h-[85vh] custom-scrollbar relative mx-auto max-w-7xl">
                    {/* Decorative glow in menu */}
                    <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    
                    {TOOL_CATEGORIES.map((cat, idx) => (
                      <motion.div 
                        key={cat.title} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex flex-col gap-5"
                      >
                        <div className="flex items-center gap-3 text-blue-400 mb-2 group/cat">
                          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover/cat:bg-blue-500 group-hover/cat:text-white transition-all">
                            <cat.icon size={20} />
                          </div>
                          <h3 className="font-black text-[11px] uppercase tracking-[0.2em]">{cat.title}</h3>
                        </div>
                        <ul className="flex flex-col gap-3.5">
                          {cat.tools.map((tool) => (
                            <li key={tool.id}>
                              <Link 
                                to={tool.path}
                                onClick={() => setShowMegaMenu(false)}
                                className="text-[14px] font-medium text-white/50 hover:text-white flex items-center gap-3 group/link transition-colors"
                              >
                                <ChevronRight size={12} className="text-blue-500/0 group-hover/link:text-blue-500 -ml-4 group-hover/link:ml-0 transition-all" />
                                {tool.name}
                                {tool.isNew && (
                                  <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full uppercase font-black tracking-tighter">New</span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/workspace" className="hover:text-white transition-colors">Workspace</Link>
          <Link to="/features" className="hover:text-white transition-colors">Features</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={openSearch} className="flex items-center gap-2 text-xs font-medium text-white/50 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-white/5">
            <Search size={14} />
            <span>Cmd K</span>
          </button>
          
          <button className="text-white/70 hover:text-white transition-colors hidden sm:block">
            <Settings size={18} />
          </button>

          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-white/70 hover:text-white transition-colors p-1"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 inset-x-4 glass-panel rounded-3xl p-6 md:hidden flex flex-col gap-4 shadow-2xl pointer-events-auto border border-white/10 max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest px-4 mb-2">Navigation</div>
              <Link to="/" onClick={() => setShowMobileMenu(false)} className="text-lg font-bold text-white p-4 rounded-2xl bg-white/5 flex items-center justify-between">
                Home <ChevronRight size={18} className="text-white/20" />
              </Link>
              <Link to="/workspace" onClick={() => setShowMobileMenu(false)} className="text-lg font-bold text-white p-4 rounded-2xl bg-white/5 flex items-center justify-between">
                Workspace <ChevronRight size={18} className="text-white/20" />
              </Link>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest px-4 mb-2">All Tools</div>
              {TOOL_CATEGORIES.map((cat) => (
                <div key={cat.title} className="flex flex-col gap-2">
                  <button 
                    onClick={() => setActiveMobileCategory(activeMobileCategory === cat.title ? null : cat.title)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${activeMobileCategory === cat.title ? 'bg-blue-600 text-white' : 'bg-white/5 text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon size={20} className={activeMobileCategory === cat.title ? 'text-white' : 'text-blue-400'} />
                      <span className="font-bold">{cat.title}</span>
                    </div>
                    <ChevronDown size={18} className={`transition-transform ${activeMobileCategory === cat.title ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {activeMobileCategory === cat.title && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white/5 rounded-2xl flex flex-col px-4"
                      >
                        {cat.tools.map((tool) => (
                          <Link 
                            key={tool.id} 
                            to={tool.path}
                            onClick={() => setShowMobileMenu(false)}
                            className="py-4 border-b border-white/5 last:border-none text-white/60 flex items-center justify-between group"
                          >
                            <span>{tool.name}</span>
                            <ChevronRight size={14} className="text-white/10 group-active:text-white" />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}


