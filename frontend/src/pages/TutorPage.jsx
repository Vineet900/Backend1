import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BrainCircuit, 
  Info,
  RotateCcw,
  MessageSquareCode,
  Zap
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { t } from '../data/i18n'
import { API_BASE_URL } from '../lib/api'

export default function TutorPage() {
  const { state } = useApp()
  const language = state.language
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your DevSchool AI Mentor. I can help you understand complex coding concepts, debug your logic, or guide you through your current roadmap. What's on your mind today?",
      id: 1 
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = { role: 'user', content: input, id: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          history: messages.slice(-5), // Send last 5 messages for context
          language: state.language,
          level: state.learningLevel,
        }),
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer || "I'm sorry, I encountered an error processing your request. Please try again.",
        id: Date.now() + 1
      }])
    } catch (error) {
      console.error('Tutor Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Network error. Please check your connection and try again.",
        id: Date.now() + 1
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-deep pt-24 pb-8 px-4 md:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-cyan/5 blur-[180px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple/5 blur-[180px]"></div>
      </div>

      <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Bot size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">AI <span className="text-brand-cyan">Mentor</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Active & Ready</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setMessages([messages[0]])}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <RotateCcw size={14} /> Clear Chat
          </button>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 glass-card rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col bg-mesh">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} items-start gap-4`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex-shrink-0 flex items-center justify-center text-brand-cyan border border-brand-cyan/20">
                      <Zap size={20} />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-3xl text-sm leading-relaxed ${
                    msg.role === 'assistant' 
                    ? 'bg-white/[0.03] border border-white/5 text-white/80 rounded-tl-none shadow-xl' 
                    : 'bg-brand-cyan text-bg-deep font-bold rounded-tr-none shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                  }`}>
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 flex-shrink-0 flex items-center justify-center text-brand-cyan border border-brand-cyan/30">
                      <User size={20} />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex-shrink-0 flex items-center justify-center text-brand-cyan border border-brand-cyan/20">
                    <Zap size={20} />
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-3xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 md:p-8 bg-white/[0.02] border-t border-white/5">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask your AI Mentor about React hooks, CSS layouts, or anything else..."
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-8 pr-20 py-6 text-white text-sm outline-none focus:border-brand-cyan/50 focus:bg-white/10 transition-all resize-none max-h-32 group-focus-within:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-4 bottom-4 w-12 h-12 rounded-2xl bg-brand-cyan text-bg-deep flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:grayscale"
              >
                <Send size={20} />
              </button>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2"><BrainCircuit size={14} /> Neural Processing</div>
              <div className="flex items-center gap-2"><Sparkles size={14} /> context Aware</div>
              <div className="flex items-center gap-2"><MessageSquareCode size={14} /> real-time debugging</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
