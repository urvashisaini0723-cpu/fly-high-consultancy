import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSend, 
  FiX, 
  FiMaximize2, 
  FiMinimize2, 
  FiRefreshCw, 
  FiUser, 
  FiMessageSquare, 
  FiCpu,
  FiHelpCircle,
  FiInfo,
  FiMail,
  FiPhone,
  FiClock
} from "react-icons/fi";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Hi! I'm FlyBot — your Fly High Consultancy assistant. Ask me about study visas, PTE coaching, interview prep, tourist visas, or anything about studying abroad.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check scrollbar visibility
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const hasOverflow = container.scrollHeight > container.clientHeight;
      setShowScrollbar(hasOverflow);
    }
  }, [messages]);

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
  };

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMsg = { role: "user", content: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
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
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Sorry, something went wrong!", timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Connection issue. Please try again or WhatsApp us at +91-93061-42129 📱", timestamp: new Date() }]);
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
      { role: "assistant", content: "Chat cleared! How can I help you with Fly High Consultancy services today? ✈️", timestamp: new Date() }
    ]);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setIsMaximized(false);
  };

  // Quick reply questions
  const quickReplies = [
    { text: "What services do you offer?", icon: FiHelpCircle },
    { text: "Tell me about PTE coaching", icon: FiInfo },
    { text: "How can I contact you?", icon: FiMail },
    { text: "I need help with something else", icon: FiHelpCircle },
  ];

  const handleQuickReply = (text) => {
    setInput(text);
    sendMessage();
  };

  // Mobile styles
  const mobileStyles = {
    width: isMobile ? "100vw" : isMaximized ? "500px" : "380px",
    height: isMobile ? "100vh" : isMaximized ? "650px" : "520px",
    maxWidth: isMobile ? "100vw" : "90vw",
    maxHeight: isMobile ? "100vh" : "85vh",
    borderRadius: isMobile ? "0" : "1.5rem",
    bottom: isMobile ? "0" : "1.25rem",
    right: isMobile ? "0" : "1.25rem",
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        onClick={toggleChat}
        aria-label="Open FlyBot - Chat with FlyBot"
        whileHover={{ scale: 1.1, rotate: 3 }}
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 16px 64px rgba(102, 126, 234, 0.5), 0 0 0 4px rgba(255,255,255,0.2)"
        }}
      >
        {/* Robot Mascot - Premium SVG */}
        <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ transform: "translateZ(20px)" }}>
          <defs>
            <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea"/>
              <stop offset="50%" stopColor="#764ba2"/>
              <stop offset="100%" stopColor="#667eea"/>
            </linearGradient>
            <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7"/>
              <stop offset="50%" stopColor="#ec4899"/>
              <stop offset="100%" stopColor="#a855f7"/>
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Head */}
          <rect x="10" y="8" width="36" height="32" rx="14" fill="url(#robotGradient)" filter="url(#glow)"/>
          
          {/* Eyes */}
          <g transform="translate(28, 30)">
            <ellipse cx="-10" cy="0" rx="7" ry="8" fill="#1a1a2e"/>
            <ellipse cx="-10" cy="-1" rx="5" ry="6" fill="url(#eyeGlow)">
              <animate attributeName="ry" values="6;2;6" dur="4s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="10" cy="0" rx="7" ry="8" fill="#1a1a2e"/>
            <ellipse cx="10" cy="-1" rx="5" ry="6" fill="url(#eyeGlow)">
              <animate attributeName="ry" values="6;2;6" dur="4s" repeatCount="indefinite" begin="0.2s"/>
            </ellipse>
          </g>
          
          {/* Antenna */}
          <g transform="translate(28, 8)">
            <rect x="-2" y="-14" width="4" height="16" rx="2" fill="#667eea"/>
            <circle cx="0" cy="-14" r="4" fill="#a855f7">
              <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <path d="M-8 -14 Q-12 -18 -8 -18" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.6">
              <animate attributeName="opacity" values="0;0.6;0" dur="1.5s" repeatCount="indefinite"/>
            </path>
          </g>
          
          {/* Mouth */}
          <g transform="translate(28, 62)">
            <rect x="-10" y="0" width="20" height="4" rx="2" fill="#1a1a2e"/>
            <g className="eq-bars">
              <rect x="-7" y="1" width="3" height="4" rx="1" fill="#a855f7">
                <animate attributeName="height" values="4;10;4;8;6;4" dur="0.4s" repeatCount="indefinite"/>
                <animate attributeName="y" values="1;-5;1;-3;-1;1" dur="0.4s" repeatCount="indefinite"/>
              </rect>
              <rect x="-3" y="1" width="3" height="4" rx="1" fill="#a855f7">
                <animate attributeName="height" values="4;8;4;10;4" dur="0.4s" repeatCount="indefinite" begin="0.05s"/>
                <animate attributeName="y" values="1;-3;1;-5;1" dur="0.4s" repeatCount="indefinite" begin="0.05s"/>
              </rect>
              <rect x="1" y="1" width="3" height="4" rx="1" fill="#a855f7">
                <animate attributeName="height" values="4;6;4;8;4" dur="0.4s" repeatCount="indefinite" begin="0.1s"/>
                <animate attributeName="y" values="1;-1;1;-3;1" dur="0.4s" repeatCount="indefinite" begin="0.1s"/>
              </rect>
              <rect x="5" y="1" width="3" height="4" rx="1" fill="#a855f7">
                <animate attributeName="height" values="4;10;4;8;6;4" dur="0.4s" repeatCount="indefinite" begin="0.15s"/>
                <animate attributeName="y" values="1;-5;1;-3;-1;1" dur="0.4s" repeatCount="indefinite" begin="0.15s"/>
              </rect>
            </g>
          </g>
        </svg>
        
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full border-3 border-purple-400/50 animate-ping" />
        
        {/* Online indicator */}
        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white animate-pulse" />
        
        {/* Tooltip */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-max whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-white shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: "#1a1a2e" }}>
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
            className="fixed flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 z-50"
            style={{
              ...mobileStyles,
              background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
              border: "1px solid rgba(168, 111, 247, 0.15)",
              boxShadow: "0 25px 80px rgba(102, 126, 234, 0.15), 0 0 0 1px rgba(255,255,255,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <div className="absolute inset-0 opacity-10">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 50 Q25 30 50 50 Q75 70 90 50" stroke="white" strokeWidth="2" strokeDasharray="10 5" opacity="0.5"/>
                </svg>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center relative" 
                  style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
                  <svg width="24" height="24" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="miniRobotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea"/>
                        <stop offset="100%" stopColor="#764ba2"/>
                      </linearGradient>
                    </defs>
                    <rect x="8" y="4" width="40" height="40" rx="12" fill="url(#miniRobotGradient)"/>
                    <g transform="translate(28, 32)">
                      <ellipse cx="-7" cy="0" rx="5" ry="6" fill="#1a1a2e"/>
                      <ellipse cx="-7" cy="-1" rx="3" ry="4" fill="#a855f7">
                        <animate attributeName="ry" values="4;1;4" dur="4s" repeatCount="indefinite"/>
                      </ellipse>
                      <ellipse cx="7" cy="0" rx="5" ry="6" fill="#1a1a2e"/>
                      <ellipse cx="7" cy="-1" rx="3" ry="4" fill="#a855f7">
                        <animate attributeName="ry" values="4;1;4" dur="4s" repeatCount="indefinite" begin="0.2s"/>
                      </ellipse>
                    </g>
                  </svg>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">FlyBot</p>
                  <p className="text-purple-100 text-xs truncate">Fly High Consultancy • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-10">
                <button
                  onClick={toggleMaximize}
                  className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
                </button>
                <button
                  onClick={toggleChat}
                  className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label="Close chat"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4" 
              style={{ 
                overscrollBehavior: 'contain',
                overflowY: showScrollbar ? 'auto' : 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: '#a855f7 transparent'
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
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                      msg.role === "user"
                        ? "rounded-br-md"
                        : "rounded-bl-md"
                    }`} 
                      style={{
                        background: msg.role === "user" 
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "#f3f4f6",
                        color: msg.role === "user" ? "white" : "#1f2937",
                        boxShadow: msg.role === "user" 
                          ? "0 4px 15px rgba(102, 126, 234, 0.3)" 
                          : "0 2px 8px rgba(15, 23, 42, 0.08)"
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === "assistant" && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                            <FiMessageSquare size={12} className="text-white" />
                          </div>
                        )}
                        <div>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-60 text-right">{formatTime(msg.timestamp)}</p>
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
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                      <FiMessageSquare size={12} className="text-white" />
                    </div>
                    <div className="flex gap-1">
                      <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Reply Buttons - Only show on first message */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-3 border-t border-purple-100 bg-white/50">
                <p className="text-xs text-purple-600 px-2 mb-2 font-medium">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((q, i) => (
                    <motion.button
                      key={i}
                      onClick={() => handleQuickReply(q.text)}
                      className="px-3 py-1.5 text-xs rounded-full text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all whitespace-nowrap flex items-center gap-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <q.icon size={12} />
                      {q.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-purple-100 flex-shrink-0" style={{ background: "rgba(255,255,255,0.95)" }}>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about visas, PTE, interviews..."
                    rows={1}
                    maxRows={4}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 pr-12 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 resize-none transition-all"
                    style={{ 
                      minHeight: "44px",
                      maxHeight: "140px",
                      fontFamily: "inherit"
                    }}
                  />
                  <button
                    onClick={clearChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 transition-colors flex items-center justify-center"
                    aria-label="Clear chat"
                  >
                    <FiRefreshCw size={16} />
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
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                    boxShadow: input.trim() && !isLoading 
                      ? "0 4px 15px rgba(102, 126, 234, 0.4)" 
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