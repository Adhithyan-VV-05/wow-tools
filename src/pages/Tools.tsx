import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { TOOL_CATEGORIES } from "@/constants/tools"

const ToolCategory = ({ title, icon: Icon, tools, color }: { title: string, icon: any, tools: any[], color: string }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${color}`}>
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool, index) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            to={tool.path}
            className="group block p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 relative overflow-hidden h-full"
          >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={16} className="text-blue-400" />
            </div>
            <h3 className="text-white font-bold mb-1 group-hover:text-blue-400 transition-colors flex items-center gap-2">
              {tool.name}
              {tool.isNew && <span className="text-[8px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest">New</span>}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed">{tool.desc}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
)

export default function Tools() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          All <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Tools</span>
        </h1>
        <p className="text-white/40 text-lg max-w-2xl">
          Everything you need to manage your documents locally. 130+ professional utilities running entirely in your browser.
        </p>
      </header>

      <div className="space-y-16">
        {TOOL_CATEGORIES.map((cat, i) => (
          <ToolCategory key={i} {...cat} />
        ))}
      </div>
    </div>
  )
}
