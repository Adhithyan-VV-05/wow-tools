import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  ExternalLink,
  User,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function Landing() {
  const [devState, setDevState] = useState<
    "idle" | "collapsing" | "charging" | "exploding"
  >("idle")

  const [isFloating, setIsFloating] = useState(false)

  const handleDevClick = () => {
    if (devState !== "idle") return

    const collapseTime = 400
    const chargeTime = 2000
    const explodeTime = 600

    setDevState("collapsing")

    setTimeout(() => {
      setIsFloating(true)
      setDevState("charging")
    }, collapseTime)

    setTimeout(() => {
      setDevState("exploding")
    }, collapseTime + chargeTime)

    setTimeout(() => {
      window.open("https://adhithyan-vv.netlify.app", "_blank")
    }, collapseTime + chargeTime + explodeTime)

    setTimeout(() => {
      setDevState("idle")
      setIsFloating(false)
    }, 4500)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    show: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&display=swap');
          .font-outfit { font-family: 'Outfit', sans-serif; }
          .atom-gradient {
            background:
              radial-gradient(circle at 30% 30%, #00f0ff, transparent 35%),
              radial-gradient(circle at 70% 70%, #ff00aa, transparent 35%),
              radial-gradient(circle at 50% 50%, #8a2be2, #00f0ff);
            background-size: 300% 300%;
            animation: moveGradient 0.5s infinite alternate ease-in-out;
          }
          @keyframes moveGradient {
            0% { background-position: 0% 0%; filter: hue-rotate(0deg); }
            100% { background-position: 100% 100%; filter: hue-rotate(120deg); }
          }
        `}
      </style>

      <div className="font-outfit flex flex-col items-center pt-20 relative min-h-screen overflow-x-hidden bg-[#030305] text-white">
        <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2 + "px",
                height: Math.random() * 4 + 2 + "px",
                background: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, 255, ${Math.random() * 0.3 + 0.1})`,
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
              animate={{
                y: [0, -300, 0],
                x: [0, (Math.random() - 0.5) * 150, 0],
                opacity: [0.1, 0.7, 0.1],
                scale: [1, 2.5, 1],
              }}
              transition={{ duration: 10 + Math.random() * 15, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-7xl mx-auto text-center relative z-10 pt-16 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -z-10"
          />

          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold text-cyan-300 uppercase tracking-[0.4em] mb-10 shadow-2xl backdrop-blur-md">
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              The Future of Work is Web
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-black tracking-tighter text-white mb-8 leading-[0.9] whitespace-nowrap text-[clamp(2.5rem,10vw,12rem)]"
          >
            <motion.span
              animate={{ textShadow: ["0 0 20px rgba(0,240,255,0)", "0 0 60px rgba(0,240,255,0.4)", "0 0 20px rgba(0,240,255,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500"
            >
              W
            </motion.span>
            ORK {"  "}
            <motion.span
              animate={{ textShadow: ["0 0 20px rgba(0,240,255,0)", "0 0 60px rgba(0,240,255,0.4)", "0 0 20px rgba(0,240,255,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500"
            >
              O
            </motion.span>
            N{" "}
            <motion.span
              animate={{ textShadow: ["0 0 20px rgba(0,240,255,0)", "0 0 60px rgba(0,240,255,0.4)", "0 0 20px rgba(0,240,255,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500"
            >
              W
            </motion.span>
            EB.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-2xl md:text-3xl text-white/40 max-w-3xl mx-auto mb-20 font-light tracking-wide px-4"
          >
            Secure, lightning-fast, and 100% local.
            <br className="hidden sm:block" />
            <span className="text-white/80 font-medium">The ultimate document operating system.</span>
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
            <Link to="/tools">
              <motion.div
                whileHover={{ y: -8, scale: 1.02, boxShadow: "0px 20px 40px -10px rgba(59,130,246,0.6)" }}
                whileTap={{ scaleX: 1.1, scaleY: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="group relative px-12 py-6 sm:px-16 sm:py-8 bg-white text-black font-black rounded-full text-lg sm:text-xl overflow-hidden flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </motion.div>
            </Link>

            <Link to="/workspace">
              <motion.div
                whileHover={{ borderRadius: "16px", scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(0,240,255,0.5)" }}
                whileTap={{ rotate: -5, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="px-12 py-6 sm:px-16 sm:py-8 bg-transparent border-2 border-white/10 text-white font-bold rounded-full text-lg sm:text-xl transition-all shadow-xl flex items-center justify-center"
              >
                Workspace
              </motion.div>
            </Link>
          </motion.div>

          {!isFloating && (
            <motion.div variants={itemVariants} className="flex justify-center pb-40">
              <motion.button
                onClick={handleDevClick}
                className="relative overflow-hidden group will-change-transform transform-gpu backdrop-blur-2xl border border-cyan-400/10 shadow-[0_0_60px_rgba(0,240,255,0.12)] bg-[#0a0a0c]/90 px-8 py-5 rounded-[28px]"
                animate={
                  devState === "collapsing"
                    ? { scale: [1, 0.8, 0], opacity: [1, 1, 0] }
                    : {}
                }
                transition={{ duration: 0.4, ease: "anticipate" }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0"
                  animate={devState === "collapsing" ? { opacity: [0, 0.8, 1], scale: [1, 1.2, 1.5] } : {}}
                  transition={{ duration: 0.4 }}
                  style={{ background: "radial-gradient(circle, rgba(0,240,255,0.4), transparent 70%)" }}
                />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User size={22} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-lg sm:text-xl font-black tracking-widest">Adhithyan V V</span>
                    <span className="text-xs text-cyan-300 tracking-[0.3em] uppercase">Meet Developer</span>
                  </div>
                  <div className="p-3 rounded-full bg-white/5">
                    <ExternalLink size={16} className="text-white/50" />
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </motion.section>

        <AnimatePresence>
          {isFloating && (
            <motion.div
              className="fixed top-1/2 left-1/2 z-[999999]"
              style={{ marginLeft: -45, marginTop: -45 }}
              animate={
                devState === "charging"
                  ? {
                      scale: [1, 0.5],
                      x: [0, -6, 6, -8, 8, -4, 4, 0],
                      y: [0, 6, -6, 8, -8, 4, -4, 0],
                    }
                  : devState === "exploding"
                  ? {
                      scale: [0.5, 80, 200],
                      x: [0, -30, 30, -20, 20, -40, 40, 0],
                      y: [0, 30, -30, 20, -20, 40, -40, 0],
                    }
                  : {}
              }
              transition={
                devState === "charging"
                  ? {
                      scale: { duration: 2.0, ease: "easeInOut" },
                      x: { duration: 0.08, repeat: Infinity, repeatType: "mirror" },
                      y: { duration: 0.08, repeat: Infinity, repeatType: "mirror", delay: 0.04 },
                    }
                  : devState === "exploding"
                  ? {
                      scale: { duration: 0.6, ease: "easeIn" },
                      x: { duration: 0.05, repeat: Infinity, repeatType: "mirror" },
                      y: { duration: 0.05, repeat: Infinity, repeatType: "mirror" },
                    }
                  : {}
              }
            >
              <motion.div
                className="relative w-[90px] h-[90px] rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_120px_rgba(0,240,255,0.8)]"
                style={{
                  background: devState === "exploding" ? "#ffffff" : "radial-gradient(circle at 30% 30%, #00f0ff, transparent 35%), radial-gradient(circle at 70% 70%, #ff00aa, transparent 35%), radial-gradient(circle at 50% 50%, #8a2be2, #00f0ff)",
                  backgroundSize: "300% 300%",
                }}
              >
                {devState !== "exploding" && (
                  <>
                    <motion.div
                      className="absolute inset-0"
                      animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                      style={{ background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent 70%)" }}
                    />
                    <motion.div
                      className="absolute inset-[-6px] rounded-full border border-cyan-300/80"
                      animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                      transition={{ rotate: { duration: 0.5, repeat: Infinity, ease: "linear" }, scale: { duration: 0.25, repeat: Infinity } }}
                    />
                    <motion.div
                      className="absolute inset-[-12px] rounded-full border border-pink-400/80"
                      animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                      transition={{ rotate: { duration: 0.4, repeat: Infinity, ease: "linear" }, scale: { duration: 0.2, repeat: Infinity } }}
                    />
                    <motion.div
                      animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
                      transition={{ rotate: { duration: 0.3, repeat: Infinity, ease: "linear" }, scale: { duration: 0.1, repeat: Infinity } }}
                      className="relative z-20 text-white"
                    >
                      <ExternalLink size={30} className="drop-shadow-[0_0_20px_rgba(255,255,255,1)]" />
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="w-full max-w-5xl mx-auto mt-10 mb-40 text-center px-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative py-20 sm:p-20"
          >
            <div className="absolute -inset-20 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-[100px] opacity-40 -z-10 rounded-full" />
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-10 leading-tight italic tracking-tighter">
              "Your browser is no longer a viewer.<br />It's a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">Powerhouse.</span>"
            </h2>
            <div className="text-cyan-500 font-black text-xs sm:text-sm uppercase tracking-[1em] opacity-60">WOW: Work On Web</div>
          </motion.div>
        </section>
      </div>
    </>
  )
}