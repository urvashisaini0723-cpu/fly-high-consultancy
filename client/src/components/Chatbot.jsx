import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiX, FiMaximize2, FiMinimize2, FiRefreshCw, FiUser, FiMessageSquare, FiCpu } from "react-icons/fi";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm FlyBot ✈️ — your Fly High Consultancy assistant. Ask me about study visas, PTE coaching, interview prep, tourist visas, or anything related to studying abroad!" }
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

  // Suggested quick questions
  const quickQuestions = [
    "🇨🇦 Canada Study Visa requirements?",
    "📝 PTE coaching batch timings?",
    "🎤 Visa interview preparation?",
    "💰 Fee structure for services?",
    "📄 Documents needed for visa?",
    "🏢 Office location & timings?"
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        onClick={toggleChat}
        aria-label="Open FlyBot"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        style={{ 
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0ea5e9 100%)",
          boxShadow: "0 10px 40px rgba(14, 165, 233, 0.4), 0 0 0 2px rgba(255,255,255,0.1)"
        }}
      >
        <img 
          src="/logo.png" 
          alt="Fly High Consultancy" 
          className="w-full h-full object-contain"
          style={{ width: "48px", height: "48px" }}
        />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full border-2 border-sky-400/50 animate-ping" />
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
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center relative" 
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                  <img 
                    src="/logo.png" 
                    alt="Fly High Consultancy" 
                    className="w-full h-full object-contain"
                    style={{ width: "28px", height: "28px" }}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-navy-900" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">FlyBot</p>
                  <p className="text-sky-200 text-xs">Fly High Consultancy • Online</p>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 50 Q25 30 50 50 Q75 70 90 50' stroke='%230ea5e9' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3C/svg%3E")`,
              backgroundSize: "200px"
            }}>
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
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)" }}>
                            <FiMessageSquare size={12} className="text-white" />
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

            {/* Quick Questions (only when not maximized or first load) */}
            {!isMaximized && messages.length <= 1 && (
              <div className="px-4 pb-2 space-y-1 border-t border-sky-100">
                <p className="text-xs text-sky-600 px-2 mb-1 font-medium">Quick questions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickQuestions.map((q, i) => (
                    <motion.button
                      key={i}
                      onClick={() => { setInput(q); sendMessage(); }}
                      className="px-3 py-1.5 text-xs rounded-full text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all whitespace-nowrap"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-sky-100 flex-shrink-0" style={{ background: "rgba(255,255,255,0.95)" }}>
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
                    className="w-full px-4 py-2.5 pr-12 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 resize-none transition-all"
                    style={{ 
                      minHeight: "44px",
                      maxHeight: "140px",
                      fontFamily: "inherit"
                    }}
                  />
                  <button
                    onClick={clearChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors flex items-center justify-center"
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