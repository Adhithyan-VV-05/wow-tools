// import { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { ArrowRight, FileText, Shield, Zap, Layout, Sparkles, ExternalLink, User } from "lucide-react"
// import { Link } from "react-router-dom"

// export default function Landing() {
//   const [isRedirecting, setIsRedirecting] = useState(false)
//   const [burst, setBurst] = useState(false)

//   const handleDevClick = () => {
//     setIsRedirecting(true)
//     setTimeout(() => setBurst(true), 1200)
//     setTimeout(() => {
//       window.open('https://adhithyan-vv.netlify.app', '_blank')
//     }, 2000)
    
//     // Reset after some time
//     setTimeout(() => {
//       setIsRedirecting(false)
//       setBurst(false)
//     }, 5000)
//   }

//   return (
//     <div className="flex flex-col items-center pt-20 relative min-h-screen overflow-x-hidden">
//       {/* Background Animated Particles - Eye Catchy */}
//       <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
//         {[...Array(30)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute rounded-full"
//             style={{
//               width: Math.random() * 4 + 2 + "px",
//               height: Math.random() * 4 + 2 + "px",
//               background: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, 255, ${Math.random() * 0.3 + 0.1})`,
//               left: Math.random() * 100 + "%",
//               top: Math.random() * 100 + "%",
//             }}
//             animate={{
//               y: [0, -300, 0],
//               x: [0, (Math.random() - 0.5) * 150, 0],
//               opacity: [0.1, 0.7, 0.1],
//               scale: [1, 2.5, 1],
//             }}
//             transition={{
//               duration: 10 + Math.random() * 15,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />
//         ))}
//       </div>

//       {/* Simplified Hero Content */}
//       <section className="w-full max-w-5xl mx-auto text-center relative z-10 pt-20">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1.5, ease: "easeOut" }}
//           className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] bg-blue-600/5 rounded-full blur-[150px] -z-10"
//         />

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-12 shadow-2xl backdrop-blur-md"
//         >
//           <Sparkles size={14} className="text-cyan-400" />
//           The Future of Work is Web
//         </motion.div>

//         <motion.h1
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
//           className="text-7xl md:text-[11rem] font-black tracking-tighter text-white mb-10 leading-[0.8]"
//         >
//           WORK ON <br />
//           <motion.span 
//             animate={{ 
//               textShadow: ["0 0 20px rgba(59,130,246,0)", "0 0 60px rgba(59,130,246,0.5)", "0 0 20px rgba(59,130,246,0)"]
//             }}
//             transition={{ duration: 3, repeat: Infinity }}
//             className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400"
//           >
//             WEB.
//           </motion.span>
//         </motion.h1>

//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 1, delay: 0.5 }}
//           className="text-xl md:text-3xl text-white/30 max-w-3xl mx-auto mb-20 font-light tracking-tight"
//         >
//           Secure, lightning-fast, and 100% local. <br />
//           <span className="text-white/60">The ultimate document operating system, right in your browser.</span>
//         </motion.p>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.8 }}
//           className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-40"
//         >
//           <Link
//             to="/tools"
//             className="group relative px-16 py-8 bg-white text-black font-black rounded-full text-xl hover:scale-110 transition-all shadow-[0_30px_70px_rgba(255,255,255,0.2)] overflow-hidden active:scale-95"
//           >
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
//             <span className="relative z-10">Get Started</span>
//           </Link>
//           <Link
//             to="/workspace"
//             className="px-16 py-8 bg-transparent border-2 border-white/10 text-white font-black rounded-full text-xl hover:bg-white hover:text-black transition-all hover:border-white shadow-xl active:scale-95"
//           >
//             Workspace
//           </Link>
//         </motion.div>

//         {/* Developer Card Section */}
//         <div className="flex flex-col items-center gap-8 pb-32 relative group">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em]"
//           >
//             Meet The Developer
//           </motion.div>

//           <div className="relative">
//             <AnimatePresence>
//               {burst && (
//                 <motion.div
//                   initial={{ scale: 0, opacity: 1 }}
//                   animate={{ scale: 25, opacity: 0 }}
//                   exit={{ opacity: 0 }}
//                   transition={{ duration: 0.6, ease: "easeOut" }}
//                   className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-cyan-500 z-50 pointer-events-none blur-sm"
//                 />
//               )}
//             </AnimatePresence>

//             <motion.button
//               onClick={handleDevClick}
//               animate={isRedirecting ? {
//                 y: -180,
//                 rotate: 1080,
//                 scale: 0.3,
//                 borderRadius: "50%",
//                 backgroundColor: "#06b6d4",
//                 boxShadow: "0 0 100px rgba(6, 182, 212, 1)"
//               } : {
//                 y: 0,
//                 rotate: 0,
//                 scale: 1,
//               }}
//               transition={{ 
//                 duration: isRedirecting ? 1.8 : 0.6, 
//                 ease: [0.16, 1, 0.3, 1]
//               }}
//               className="relative p-1 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:200%_auto] animate-gradient shadow-2xl overflow-hidden group/card active:scale-95"
//             >
//               <div className="relative px-12 py-6 bg-[#0a0a0b] rounded-2xl flex items-center gap-6 group-hover/card:bg-transparent transition-colors duration-700">
//                 <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-inner">
//                   <User size={28} />
//                 </div>
//                 <div className="flex flex-col items-start">
//                   <span className="text-xl font-black text-white uppercase tracking-widest leading-none mb-1">Adhithyan V V</span>
//                   <span className="text-[11px] text-white/30 font-bold group-hover/card:text-white/70 transition-colors uppercase tracking-tighter">Fullstack Creative Developer</span>
//                 </div>
//                 <div className="ml-6 p-3 rounded-full bg-white/5 group-hover/card:bg-white group-hover/card:text-black transition-all">
//                   <ExternalLink size={16} />
//                 </div>
//               </div>
//             </motion.button>
//           </div>
//         </div>
//       </section>

//       {/* Floating Documents Background - High Catchy Factor */}
//       <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
//         {[...Array(15)].map((_, i) => (
//           <motion.div
//             key={i}
//             initial={{ 
//               x: Math.random() * window.innerWidth, 
//               y: -400, 
//               rotate: Math.random() * 360,
//               opacity: 0
//             }}
//             animate={{ 
//               y: window.innerHeight + 400,
//               rotate: 1440,
//               opacity: [0, 0.25, 0.25, 0],
//               x: (Math.random() - 0.5) * 600 + (Math.random() * window.innerWidth)
//             }}
//             transition={{ 
//               duration: 25 + Math.random() * 35, 
//               repeat: Infinity, 
//               ease: "linear",
//               delay: Math.random() * 20
//             }}
//             className="absolute w-44 h-56 border border-white/5 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent backdrop-blur-[3px] flex items-center justify-center shadow-2xl shadow-blue-500/5"
//           >
//             <div className="flex flex-col gap-4 items-center opacity-10">
//                <FileText size={48} className="text-blue-400" />
//                <div className="w-16 h-1 bg-white/30 rounded-full" />
//                <div className="w-10 h-1 bg-white/30 rounded-full" />
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       {/* Catchy Quote Section */}
//       <section className="w-full max-w-4xl mx-auto mt-40 mb-40 text-center px-4">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1.5, ease: "easeOut" }}
//           className="relative p-20"
//         >
//           <div className="absolute -inset-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-[100px] opacity-50 -z-10" />
//           <h2 className="text-6xl md:text-8xl font-black text-white mb-10 leading-tight italic tracking-tighter">
//             "Your browser is no longer a viewer. <br />
//             It's a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">Powerhouse.</span>"
//           </h2>
//           <div className="text-blue-500 font-black text-xs uppercase tracking-[0.8em] opacity-50">
//             WOW: Work On Web
//           </div>
//         </motion.div>
//       </section>
//     </div>
//   )



















// import { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import {
//   ArrowRight,
//   Sparkles,
//   ExternalLink,
//   User,
// } from "lucide-react"
// import { Link } from "react-router-dom"

// export default function Landing() {
//   const [devState, setDevState] = useState<
//     "idle" | "unstable" | "exploding"
//   >("idle")

//   const [isFloating, setIsFloating] = useState(false)

//   const handleDevClick = () => {
//     if (devState !== "idle") return

//     // PHASE 1 → INSTANT VIOLENT VIBRATION (0.5 Seconds)
//     setDevState("unstable")
//     setIsFloating(true)

//     // PHASE 2 → OPAQUE BLAST
//     setTimeout(() => {
//       setDevState("exploding")
//     }, 500) // Exactly 0.5s of vibration

//     // PHASE 3 → NEW TAB (Safely under the 1-second popup blocker limit!)
//     setTimeout(() => {
//       window.open("https://adhithyan-vv.netlify.app", "_blank")
//     }, 3500) // Opens right as the blast covers the screen

//     // PHASE 4 → RESET
//     setTimeout(() => {
//       setDevState("idle")
//       setIsFloating(false)
//     }, 1500)
//   }

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//         delayChildren: 0.2,
//       },
//     },
//   }

//   const itemVariants = {
//     hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
//     show: {
//       opacity: 1, y: 0, filter: "blur(0px)",
//       transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
//     },
//   }

//   return (
//     <>
//       <style>
//         {`
//           @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&display=swap');

//           .font-outfit {
//             font-family: 'Outfit', sans-serif;
//           }

//           .atom-gradient {
//             background:
//               radial-gradient(circle at 30% 30%, #00f0ff, transparent 35%),
//               radial-gradient(circle at 70% 70%, #ff00aa, transparent 35%),
//               radial-gradient(circle at 50% 50%, #8a2be2, #00f0ff);
//             background-size: 300% 300%;
//             animation: moveGradient 0.5s infinite alternate ease-in-out;
//           }

//           @keyframes moveGradient {
//             0% {
//               background-position: 0% 0%;
//               filter: hue-rotate(0deg);
//             }
//             100% {
//               background-position: 100% 100%;
//               filter: hue-rotate(120deg);
//             }
//           }
//         `}
//       </style>

//       <div className="font-outfit flex flex-col items-center pt-20 relative min-h-screen overflow-x-hidden bg-[#030305] text-white">

//         {/* PARTICLES */}
//         <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
//           {[...Array(30)].map((_, i) => (
//             <motion.div
//               key={i}
//               className="absolute rounded-full"
//               style={{
//                 width: Math.random() * 4 + 2 + "px",
//                 height: Math.random() * 4 + 2 + "px",
//                 background: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, 255, ${Math.random() * 0.3 + 0.1})`,
//                 left: Math.random() * 100 + "%",
//                 top: Math.random() * 100 + "%",
//               }}
//               animate={{
//                 y: [0, -300, 0],
//                 x: [0, (Math.random() - 0.5) * 150, 0],
//                 opacity: [0.1, 0.7, 0.1],
//                 scale: [1, 2.5, 1],
//               }}
//               transition={{
//                 duration: 10 + Math.random() * 15,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             />
//           ))}
//         </div>

//         {/* HERO */}
//         <motion.section
//           variants={containerVariants}
//           initial="hidden"
//           animate="show"
//           className="w-full max-w-7xl mx-auto text-center relative z-10 pt-16 px-4"
//         >
//           <motion.div
//             initial={{ opacity: 0, scale: 0.5 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 2 }}
//             className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -z-10"
//           />

//           <motion.div variants={itemVariants}>
//             <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold text-cyan-300 uppercase tracking-[0.4em] mb-10 shadow-2xl backdrop-blur-md">
//               <Sparkles size={14} className="text-cyan-400 animate-pulse" />
//               The Future of Work is Web
//             </div>
//           </motion.div>

//           <motion.h1
//             variants={itemVariants}
//             className="font-black tracking-tighter text-white mb-8 leading-[0.9] whitespace-nowrap text-[clamp(2.5rem,10vw,12rem)]"
//           >
//             WORK ON{" "}
//             <motion.span
//               animate={{ textShadow: ["0 0 20px rgba(0,240,255,0)", "0 0 60px rgba(0,240,255,0.4)", "0 0 20px rgba(0,240,255,0)"] }}
//               transition={{ duration: 3, repeat: Infinity }}
//               className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500"
//             >
//               WEB.
//             </motion.span>
//           </motion.h1>

//           <motion.p
//             variants={itemVariants}
//             className="text-lg sm:text-2xl md:text-3xl text-white/40 max-w-3xl mx-auto mb-20 font-light tracking-wide px-4"
//           >
//             Secure, lightning-fast, and 100% local.
//             <br className="hidden sm:block" />
//             <span className="text-white/80 font-medium">The ultimate document operating system.</span>
//           </motion.p>

//           <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
//             <Link to="/tools">
//               <motion.div
//                 whileHover={{ y: -8, scale: 1.02, boxShadow: "0px 20px 40px -10px rgba(59,130,246,0.6)" }}
//                 whileTap={{ scaleX: 1.1, scaleY: 0.9 }}
//                 transition={{ type: "spring", stiffness: 400, damping: 15 }}
//                 className="group relative px-12 py-6 sm:px-16 sm:py-8 bg-white text-black font-black rounded-full text-lg sm:text-xl overflow-hidden flex items-center justify-center"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                 <span className="relative z-10 flex items-center gap-2">
//                   Get Started <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
//                 </span>
//               </motion.div>
//             </Link>

//             <Link to="/workspace">
//               <motion.div
//                 whileHover={{ borderRadius: "16px", scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(0,240,255,0.5)" }}
//                 whileTap={{ rotate: -5, scale: 0.9 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 className="px-12 py-6 sm:px-16 sm:py-8 bg-transparent border-2 border-white/10 text-white font-bold rounded-full text-lg sm:text-xl transition-all shadow-xl flex items-center justify-center"
//               >
//                 Workspace
//               </motion.div>
//             </Link>
//           </motion.div>

//           {/* NORMAL CARD */}
//           {!isFloating && (
//             <motion.div variants={itemVariants} className="flex justify-center pb-40">
//               <motion.button
//                 onClick={handleDevClick}
//                 className="relative overflow-hidden group will-change-transform transform-gpu backdrop-blur-2xl border border-cyan-400/10 shadow-[0_0_60px_rgba(0,240,255,0.12)] bg-[#0a0a0c]/90 px-8 py-5 rounded-[28px]"
//               >
//                 <div className="flex items-center gap-5 relative z-10">
//                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
//                     <User size={22} />
//                   </div>
//                   <div className="flex flex-col items-start">
//                     <span className="text-lg sm:text-xl font-black tracking-widest">Adhithyan V V</span>
//                     <span className="text-xs text-cyan-300 tracking-[0.3em] uppercase">Meet Developer</span>
//                   </div>
//                   <div className="p-3 rounded-full bg-white/5">
//                     <ExternalLink size={16} className="text-white/50" />
//                   </div>
//                 </div>
//               </motion.button>
//             </motion.div>
//           )}
//         </motion.section>

//         {/* FLOATING & EXPLODING ELEMENT */}
//         <AnimatePresence>
//           {isFloating && (
//             <motion.div
//               className="fixed top-1/2 left-1/2 z-[999999]"
//               style={{ marginLeft: -45, marginTop: -45 }}
//             >
//               {/* CORE */}
//               <motion.div
//                 className="relative w-[90px] h-[90px] rounded-full overflow-hidden flex items-center justify-center"
                
//                 // Keep the default gradient, but turn SOLID WHITE on explosion
//                 style={{
//                   background: devState === "exploding" 
//                     ? "#ffffff" // Solid opaque white for the blast
//                     : "radial-gradient(circle at 30% 30%, #00f0ff, transparent 35%), radial-gradient(circle at 70% 70%, #ff00aa, transparent 35%), radial-gradient(circle at 50% 50%, #8a2be2, #00f0ff)",
//                   backgroundSize: devState === "exploding" ? "100% 100%" : "300% 300%",
//                 }}

//                 animate={
//                   devState === "unstable"
//                     ? {
//                         // VIOLENT VIBRATION
//                         x: [0, -40, 45, -35, 40, -50, 35, -45, 50, -30, 0],
//                         y: [0, 45, -40, 50, -35, 40, -50, 30, -45, 35, 0],
//                         rotate: [0, -15, 15, -20, 20, -10, 10, 0],
//                         scale: 1.2,
//                       }
//                     : devState === "exploding"
//                     ? {
//                         // MASSIVE OPAQUE BLAST
//                         scale: [1.2, 50, 150],
//                         opacity: 1, // Stays completely solid! No fading.
//                         filter: "blur(0px)", // No translucency!
//                       }
//                     : {}
//                 }

//                 transition={
//                   devState === "unstable"
//                     ? { duration: 0.15, repeat: Infinity, ease: "linear" } // Super fast repeating for hardware shake
//                     : devState === "exploding"
//                     ? { duration: 0.4, ease: "easeIn" } // Snappy explosion
//                     : {}
//                 }
//               >
//                 {/* INNER RINGS & ICONS DISAPPEAR ON BLAST */}
//                 {devState !== "exploding" && (
//                   <>
//                     <motion.div
//                       className="absolute inset-0"
//                       animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }}
//                       transition={{ duration: 0.2, repeat: Infinity }}
//                       style={{ background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent 70%)" }}
//                     />
//                     <motion.div
//                       className="absolute inset-[-6px] rounded-full border-2 border-cyan-300"
//                       animate={{ rotate: 360, scale: [1, 1.15, 1] }}
//                       transition={{ rotate: { duration: 0.5, repeat: Infinity, ease: "linear" }, scale: { duration: 0.25, repeat: Infinity } }}
//                     />
//                     <motion.div
//                       className="absolute inset-[-12px] rounded-full border-2 border-pink-400"
//                       animate={{ rotate: -360, scale: [1, 1.3, 1] }}
//                       transition={{ rotate: { duration: 0.4, repeat: Infinity, ease: "linear" }, scale: { duration: 0.2, repeat: Infinity } }}
//                     />
//                     <motion.div
//                       animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
//                       transition={{ rotate: { duration: 0.3, repeat: Infinity, ease: "linear" }, scale: { duration: 0.1, repeat: Infinity } }}
//                       className="relative z-20 text-white"
//                     >
//                       <ExternalLink size={30} className="drop-shadow-[0_0_20px_rgba(255,255,255,1)]" />
//                     </motion.div>
//                   </>
//                 )}
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* QUOTE */}
//         <section className="w-full max-w-5xl mx-auto mt-10 mb-40 text-center px-4 overflow-hidden">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9, y: 50 }}
//             whileInView={{ opacity: 1, scale: 1, y: 0 }}
//             viewport={{ once: true, margin: "-100px" }}
//             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
//             className="relative py-20 sm:p-20"
//           >
//             <div className="absolute -inset-20 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-[100px] opacity-40 -z-10 rounded-full" />
//             <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-10 leading-tight italic tracking-tighter">
//               "Your browser is no longer a viewer.<br />It's a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">Powerhouse.</span>"
//             </h2>
//             <div className="text-cyan-500 font-black text-xs sm:text-sm uppercase tracking-[1em] opacity-60">WOW: Work On Web</div>
//           </motion.div>
//         </section>
//       </div>
//     </>
//   )
// }






















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
  // Simplified states for a smoother, linear animation
  const [devState, setDevState] = useState<
    "idle" | "collapsing" | "charging" | "exploding"
  >("idle")

  const [isFloating, setIsFloating] = useState(false)

  const handleDevClick = () => {
    if (devState !== "idle") return

    // EXACT 3-SECOND TIMELINE
    const collapseTime = 400   // Card collapses (0.4s)
    const chargeTime = 2000    // Shrinks & vibrates (2.0s)
    const explodeTime = 600    // Massive blast (0.6s)

    // PHASE 1 → COLLAPSE THE CARD
    setDevState("collapsing")

    // PHASE 2 → SPAWN CORE, SUCK INWARDS & VIBRATE
    setTimeout(() => {
      setIsFloating(true)
      setDevState("charging")
    }, collapseTime) // Starts at 0.4s

    // PHASE 3 → EXPLODE WITH SHAKE
    setTimeout(() => {
      setDevState("exploding")
    }, collapseTime + chargeTime) // Starts at 2.4s

    // PHASE 4 → EXACTLY 3.0 SECONDS: OPEN NEW TAB
    setTimeout(() => {
      window.open("https://adhithyan-vv.netlify.app", "_blank")
    }, collapseTime + chargeTime + explodeTime) // Exactly 3000ms (3s)

    // PHASE 5 → RESET HIDDEN IN BACKGROUND
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
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
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

        {/* PARTICLES */}
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

        {/* HERO */}
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

          {/* NORMAL CARD */}
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
                {/* ENERGY GLOW */}
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

        {/* FLOATING, SHRINKING & EXPLODING ELEMENT */}
        <AnimatePresence>
          {isFloating && (
            <motion.div
              className="fixed top-1/2 left-1/2 z-[999999]"
              style={{ marginLeft: -45, marginTop: -45 }}
              
              // THIS CONTROLS THE MAIN SHAKE AND SHRINK
              animate={
                devState === "charging"
                  ? {
                      scale: [1, 0.5], // Smoothly sucks inwards over 2 seconds
                      x: [0, -6, 6, -8, 8, -4, 4, 0], // Fast vibration coordinates
                      y: [0, 6, -6, 8, -8, 4, -4, 0],
                    }
                  : devState === "exploding"
                  ? {
                      scale: [0.5, 80, 200], // Massive blast
                      x: [0, -30, 30, -20, 20, -40, 40, 0], // Screen shake during blast
                      y: [0, 30, -30, 20, -20, 40, -40, 0],
                    }
                  : {}
              }

              transition={
                devState === "charging"
                  ? {
                      scale: { duration: 2.0, ease: "easeInOut" }, // 2s shrink
                      x: { duration: 0.08, repeat: Infinity, repeatType: "mirror" }, // Rapid shake
                      y: { duration: 0.08, repeat: Infinity, repeatType: "mirror", delay: 0.04 }, // Offset Y for chaotic shake
                    }
                  : devState === "exploding"
                  ? {
                      scale: { duration: 0.6, ease: "easeIn" }, // 0.6s blast
                      x: { duration: 0.05, repeat: Infinity, repeatType: "mirror" }, // Violent blast shake
                      y: { duration: 0.05, repeat: Infinity, repeatType: "mirror" },
                    }
                  : {}
              }
            >
              {/* CORE */}
              <motion.div
                className="relative w-[90px] h-[90px] rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_120px_rgba(0,240,255,0.8)]"
                style={{
                  background: devState === "exploding" ? "#ffffff" : "radial-gradient(circle at 30% 30%, #00f0ff, transparent 35%), radial-gradient(circle at 70% 70%, #ff00aa, transparent 35%), radial-gradient(circle at 50% 50%, #8a2be2, #00f0ff)",
                  backgroundSize: "300% 300%",
                }}
              >
                {/* HIDE INNER RINGS DURING EXPLOSION */}
                {devState !== "exploding" && (
                  <>
                    <motion.div
                      className="absolute inset-0"
                      animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }} // Faster pulse during charge
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

        {/* QUOTE */}
        <section className="w-full max-w-5xl mx-auto mt-10 mb-40 text-center px-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
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