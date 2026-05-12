import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  Layout, 
  Code2, 
  Maximize2, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function CodeRunner({ initialCode, onRun }) {
  const [code, setCode] = useState(initialCode || `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { 
        background: #050816; 
        color: #fff; 
        font-family: sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      h1 { 
        color: #22d3ee;
        text-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
      }
    </style>
  </head>
  <body>
    <h1>Hello DevSchool!</h1>
  </body>
</html>`)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [view, setView] = useState('editor') // 'editor' or 'preview' (mobile)

  const handleRun = () => {
    setIsRunning(true)
    setTimeout(() => {
      setOutput(code)
      setIsRunning(false)
      if (onRun) onRun(code)
    }, 600)
  }

  const handleReset = () => {
    setCode(initialCode)
    setOutput('')
  }

  return (
    <div className="flex flex-col h-full bg-bg-deep rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
            <Code2 size={14} />
            index.html
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleReset}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
            title="Reset Code"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            onClick={handleRun}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-brand-cyan text-bg-deep font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
          >
            {isRunning ? (
              <div className="w-4 h-4 border-2 border-bg-deep border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            RUN
          </button>
        </div>
      </div>

      {/* Editor & Preview Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
        {/* Editor Area */}
        <div className="flex flex-col border-r border-white/5 relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-transparent p-6 font-mono text-sm text-white/80 outline-none resize-none spellcheck-false"
            placeholder="Write your code here..."
            spellCheck="false"
          />
          
          {/* Editor Status */}
          <div className="absolute bottom-4 left-6 flex items-center gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest pointer-events-none">
            <span>UTF-8</span>
            <span>Line {code.split('\n').length}</span>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex flex-col bg-[#010409]">
          <div className="px-6 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
              <Layout size={12} />
              Preview
            </div>
            <Maximize2 size={12} className="text-white/20 cursor-pointer hover:text-white transition-colors" />
          </div>
          
          <div className="flex-1 relative bg-white overflow-hidden">
            {output ? (
              <iframe
                title="preview"
                srcDoc={output}
                className="w-full h-full border-none"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-bg-deep/40 gap-4">
                <div className="w-16 h-16 rounded-full bg-bg-deep/5 flex items-center justify-center border-2 border-dashed border-bg-deep/10">
                  <Play size={24} />
                </div>
                <p className="text-sm font-bold">Press Run to see output</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
