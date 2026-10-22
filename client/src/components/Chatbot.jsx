import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiX, FiMaximize2, FiMinimize2, FiRefreshCw, FiUser, FiMessageSquare, FiCpu } from "react-icons/fi";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm FlyBot — your Fly High Consultancy assistant. Ask me about study visas, PTE coaching, interview prep, tourist visas, or anything about studying abroad." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Check if content overflows container
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const hasOverflow = container.scrollHeight > container.clientHeight;
      setShowScrollbar(hasOverflow);
    }
  }, [messages]);

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Sorry, something went wrong!" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Connection issue. Please try again or WhatsApp us at +91-93061-42129 📱" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: "assistant", content: "Chat cleared! How can I help you with Fly High Consultancy services today? ✈️" }
    ]);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setIsMaximized(false);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        className={`fixed bottom-5 right-5 z-50 w-32 h-32 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        onClick={toggleChat}
        aria-label="Open FlyBot - Chat with FlyBot"
        whileHover={{ scale: 1.12, rotate: 3 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ 
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0ea5e9 100%)",
          boxShadow: "0 16px 64px rgba(14, 165, 233, 0.5), 0 0 0 4px rgba(255,255,255,0.2)"
        }}
      >
        {/* 3D Robot Head */}
        <svg width="100" height="100" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="robotMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8ecf1"/>
              <stop offset="30%" stopColor="#cbd5e1"/>
              <stop offset="60%" stopColor="#94a3b8"/>
              <stop offset="100%" stopColor="#64748b"/>
            </linearGradient>
            <linearGradient id="robotDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b"/>
              <stop offset="50%" stopColor="#0f172a"/>
              <stop offset="100%" stopColor="#020617"/>
            </linearGradient>
            <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9"/>
              <stop offset="50%" stopColor="#06b6d4"/>
              <stop offset="100%" stopColor="#0ea5e9"/>
            </linearGradient>
            <linearGradient id="antennaGlow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9"/>
              <stop offset="100%" stopColor="#22d3ee"/>
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feOffset dx="2" dy="2"/>
              <feGaussianBlur stdDeviation="2" result="offset-blur"/>
              <feComposite in="SourceGraphic" in2="offset-blur" operator="over"/>
            </filter>
          </defs>
          
          {/* Antenna base */}
          <g className="antenna-group">
            <rect x="57" y="5" width="6" height="18" rx="3" fill="url(#robotMetal)" stroke="#475569" strokeWidth="1"/>
            <circle cx="60" cy="5" r="6" fill="url(#antennaGlow)" filter="url(#glow)">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
            </circle>
            {/* Antenna signal waves */}
            <g className="signal-waves">
              <path d="M60 -2 Q70 3 60 8" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.6">
                <animate attributeName="opacity" values="0;0.6;0" dur="1.5s" repeatCount="indefinite" begin="0s"/>
              </path>
              <path d="M60 -2 Q50 3 60 8" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.6">
                <animate attributeName="opacity" values="0;0.6;0" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
              </path>
            </g>
          </g>
          
          {/* Head main shape */}
          <rect x="15" y="25" width="90" height="70" rx="25" fill="url(#robotMetal)" stroke="#475569" strokeWidth="1.5" filter="url(#innerShadow)"/>
          
          {/* Face plate */}
          <rect x="22" y="32" width="76" height="56" rx="18" fill="url(#robotDark)" stroke="#334155" strokeWidth="1"/>
          
          {/* Left Eye */}
          <g className="eye-group">
            <ellipse cx="45" cy="58" rx="14" ry="16" fill="#020617" stroke="#1e293b" strokeWidth="2"/>
            <ellipse cx="45" cy="56" rx="10" ry="11" fill="url(#eyeGlow)" filter="url(#glow)">
              <animate attributeName="ry" values="11;1;11" dur="4s" repeatCount="indefinite" begin="0s"/>
              <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" begin="0s"/>
            </ellipse>
            <ellipse cx="42" cy="53" rx="3" ry="3" fill="#22d3ee" opacity="0.9"/>
            <ellipse cx="48" cy="60" rx="2" ry="2" fill="#06b6d4" opacity="0.6"/>
          </g>
          
          {/* Right Eye */}
          <g className="eye-group">
            <ellipse cx="75" cy="58" rx="14" ry="16" fill="#020617" stroke="#1e293b" strokeWidth="2"/>
            <ellipse cx="75" cy="56" rx="10" ry="11" fill="url(#eyeGlow)" filter="url(#glow)">
              <animate attributeName="ry" values="11;1;11" dur="4s" repeatCount="indefinite" begin="0.2s"/>
              <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" begin="0.2s"/>
            </ellipse>
            <ellipse cx="72" cy="53" rx="3" ry="3" fill="#22d3ee" opacity="0.9"/>
            <ellipse cx="78" cy="60" rx="2" ry="2" fill="#06b6d4" opacity="0.6"/>
          </g>
          
          {/* Ear pieces / side panels */}
          <rect x="5" y="40" width="12" height="35" rx="6" fill="url(#robotMetal)" stroke="#475569" strokeWidth="1">
            <animate attributeName="x" values="5;3;5" dur="3s" repeatCount="indefinite"/>
          </rect>
          <rect x="103" y="40" width="12" height="35" rx="6" fill="url(#robotMetal)" stroke="#475569" strokeWidth="1">
            <animate attributeName="x" values="103;105;103" dur="3s" repeatCount="indefinite"/>
          </rect>
          
          {/* Ear lights */}
          <circle cx="11" cy="57" r="3" fill="#0ea5e9" filter="url(#glow)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="109" cy="57" r="3" fill="#0ea5e9" filter="url(#glow)">
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          
          {/* Mouth / speaker grill */}
          <g className="mouth-group">
            <rect x="48" y="80" width="24" height="6" rx="3" fill="#020617" stroke="#1e293b" strokeWidth="1"/>
            <g className="mouth-lines">
              <line x1="50" y1="81" x2="50" y2="85" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.3s" repeatCount="indefinite"/>
              </line>
              <line x1="55" y1="81" x2="55" y2="85" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.3s" repeatCount="indefinite" begin="0.05s"/>
              </line>
              <line x1="60" y1="81" x2="60" y2="85" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.3s" repeatCount="indefinite" begin="0.1s"/>
              </line>
              <line x1="65" y1="81" x2="65" y2="85" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.3s" repeatCount="indefinite" begin="0.15s"/>
              </line>
              <line x1="70" y1="81" x2="70" y2="85" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.3s" repeatCount="indefinite" begin="0.2s"/>
              </line>
            </g>
          </g>
          
          {/* Chin detail */}
          <path d="M45 95 Q60 105 75 95" stroke="#475569" strokeWidth="2" fill="none" opacity="0.5"/>
          
          {/* Neck bolts */}
          <circle cx="35" cy="92" r="3" fill="#475569"/>
          <circle cx="85" cy="92" r="3" fill="#475569"/>
          
          {/* Subtle floating particles around head */}
          <g className="particles">
            <circle cx="10" cy="30" r="1.5" fill="#0ea5e9" opacity="0.6">
              <animate attributeName="cy" values="30;25;30" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="110" cy="35" r="1" fill="#22d3ee" opacity="0.5">
              <animate attributeName="cy" values="35;30;35" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="8" cy="90" r="1" fill="#0ea5e9" opacity="0.4">
              <animate attributeName="cx" values="8;5;8" dur="4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="112" cy="88" r="1.2" fill="#22d3ee" opacity="0.5">
              <animate attributeName="cx" values="112;115;112" dur="3.5s" repeatCount="indefinite"/>
            </circle>
          </g>
        </svg>
        
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full border-3 border-sky-400/50 animate-ping" />
        
        {/* Chat bubble indicator */}
        <motion.div
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "#10b981", boxShadow: "0 0 0 3px white" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </motion.div>
        
        {/* Tooltip */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-max whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-white shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: "#0f172a" }}>
          Chat with FlyBot
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatContainerRef}
            key="chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-5 right-5 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
              isMaximized 
                ? "w-[500px] h-[650px] max-w-[90vw] max-h-[85vh]" 
                : "w-[380px] h-[520px]"
            }`}
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid rgba(14, 165, 233, 0.15)",
              boxShadow: "0 25px 80px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(255,255,255,0.5)"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0ea5e9 100%)" }}>
              <div className="absolute inset-0 opacity-10">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 50 Q25 30 50 50 Q75 70 90 50" stroke="white" strokeWidth="2" strokeDasharray="10 5" opacity="0.5"/>
                </svg>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-24 h-24 rounded-full flex items-center justify-center relative" 
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                  <img 
                    src="/logo.png" 
                    alt="Fly High Consultancy" 
                    className="w-full h-full object-contain"
                    style={{ width: "68px", height: "68px" }}
                  />
                  <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-3 border-navy-900" />
                </div>
                <div>
                  <p className="text-white font-semibold text-base">FlyBot</p>
                  <p className="text-white text-sm">Fly High Consultancy • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-10">
                <button
                  onClick={toggleMaximize}
                  className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
                </button>
                <button
                  onClick={toggleChat}
                  className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label="Close chat"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 p-3 space-y-3" 
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 50 Q25 30 50 50 Q75 70 90 50' stroke='%230ea5e9' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3C/svg%3E")`,
                backgroundSize: "200px",
                overscrollBehavior: 'contain',
                overflowY: showScrollbar ? 'auto' : 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: '#0ea5e9 transparent'
              }}
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={`${idx}-${msg.role}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl shadow-sm ${
                      msg.role === "user"
                        ? "rounded-br-md"
                        : "rounded-bl-md"
                    }`} 
                      style={{
                        background: msg.role === "user" 
                          ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
                          : "#f1f5f9",
                        color: msg.role === "user" ? "white" : "#1e293b",
                        boxShadow: msg.role === "user" 
                          ? "0 4px 15px rgba(14, 165, 233, 0.3)" 
                          : "0 2px 8px rgba(15, 23, 42, 0.08)"
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === "assistant" && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)" }}>
                            <FiMessageSquare size={10} className="text-white" />
                          </div>
                        )}
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}>
                        <FiUser size={12} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
              
              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)" }}>
                      <FiMessageSquare size={12} className="text-white" />
                    </div>
                    <div className="flex gap-1">
                      <motion.div className="w-2 h-2 rounded-full bg-sky-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-sky-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-sky-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-sky-100 flex-shrink-0" style={{ background: "rgba(255,255,255,0.95)" }}>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about visas, PTE, interviews..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full px-3 py-2 pr-10 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 resize-none transition-all"
                    style={{ 
                      minHeight: "40px",
                      maxHeight: "120px",
                      fontFamily: "inherit"
                    }}
                  />
                  <button
                    onClick={clearChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors flex items-center justify-center"
                    aria-label="Clear chat"
                  >
                    <FiRefreshCw size={14} />
                  </button>
                </div>
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !isLoading
                      ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
                      : "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                    boxShadow: input.trim() && !isLoading 
                      ? "0 4px 15px rgba(14, 165, 233, 0.4)" 
                      : "none"
                  }}
                  aria-label="Send message"
                >
                  <FiSend size={18} className="text-white" />
                </motion.button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                FlyBot only answers Fly High Consultancy related queries ✈️
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;