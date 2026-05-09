export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-[8px] uppercase">
            WOW
          </div>
          <span className="font-semibold text-sm text-white/70">WOW-Tools</span>
        </div>
        
        <p className="text-xs text-white/40">
          Work On Web. Beyond Boundaries. © {new Date().getFullYear()} WOW-Tools.
        </p>
        
        <div className="flex items-center gap-4 text-xs text-white/50">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
