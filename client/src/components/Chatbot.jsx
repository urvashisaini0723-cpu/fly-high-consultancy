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
        {/* Premium 3D Robot Mascot - Custom SVG */}
        <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" style={{ transform: "translateZ(20px)" }}>
          <defs>
            {/* Premium Metal Gradients */}
            <linearGradient id="premiumMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc"/>
              <stop offset="15%" stopColor="#e2e8f0"/>
              <stop offset="35%" stopColor="#cbd5e1"/>
              <stop offset="50%" stopColor="#94a3b8"/>
              <stop offset="65%" stopColor="#64748b"/>
              <stop offset="80%" stopColor="#475569"/>
              <stop offset="100%" stopColor="#1e293b"/>
            </linearGradient>
            <linearGradient id="darkChrome" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155"/>
              <stop offset="30%" stopColor="#1e293b"/>
              <stop offset="60%" stopColor="#0f172a"/>
              <stop offset="100%" stopColor="#020617"/>
            </linearGradient>
            <linearGradient id="electricBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9"/>
              <stop offset="30%" stopColor="#06b6d4"/>
              <stop offset="60%" stopColor="#0ea5e9"/>
              <stop offset="100%" stopColor="#22d3ee"/>
            </linearGradient>
            <linearGradient id="warmGlow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9"/>
              <stop offset="50%" stopColor="#22d3ee"/>
              <stop offset="100%" stopColor="#67e8f9"/>
            </linearGradient>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8"/>
              <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#020617" stopOpacity="0"/>
            </radialGradient>
            
            {/* Premium Filters */}
            <filter id="premiumGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            <filter id="innerDepth" x="-50%" y="-50%" width="200%" height="200%">
              <feOffset dx="2" dy="3"/>
              <feGaussianBlur stdDeviation="2" result="shadow"/>
              <feComposite in="SourceGraphic" in2="shadow" operator="over"/>
            </filter>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0ea5e9" flood-opacity="0.4"/>
            </filter>
            <filter id="sharpGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="glow"/>
              <feComposite in="SourceGraphic" in2="glow" operator="over"/>
            </filter>
          </defs>
          
          {/* Ambient Glow Behind Robot */}
          <circle cx="64" cy="64" r="56" fill="url(#coreGlow)" filter="url(#softShadow)" opacity="0.6">
            <animate attributeName="r" values="56;58;56" dur="4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.8;0.6" dur="4s" repeatCount="indefinite"/>
          </circle>
          
          {/* Floating Energy Particles */}
          <g className="energy-particles" filter="url(#sharpGlow)">
            <circle cx="15" cy="20" r="1.5" fill="#67e8f9" opacity="0.7">
              <animate attributeName="cy" values="20;15;20" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="118" cy="25" r="1" fill="#67e8f9" opacity="0.5">
              <animate attributeName="cy" values="25;18;25" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="8" cy="95" r="1" fill="#67e8f9" opacity="0.4">
              <animate attributeName="cx" values="8;5;8" dur="4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="120" cy="92" r="1.2" fill="#67e8f9" opacity="0.5">
              <animate attributeName="cx" values="120;123;120" dur="3.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="18" cy="110" r="1" fill="#67e8f9" opacity="0.5">
              <animate attributeName="cy" values="110;105;110" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="110" cy="115" r="1" fill="#67e8f9" opacity="0.4">
              <animate attributeName="cx" values="110;107;110" dur="3.5s" repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Antenna Assembly */}
          <g className="antenna-assembly" transform="translate(64, 64)">
            <animateTransform attributeName="transform" type="rotate" values="0;2;-2;0" dur="4s" repeatCount="indefinite" additive="sum"/>
            
            {/* Antenna Base */}
            <rect x="-3" y="-58" width="6" height="22" rx="3" fill="url(#premiumMetal)" stroke="#475569" strokeWidth="1" filter="url(#innerDepth)"/>
            
            {/* Antenna Joint */}
            <circle cx="0" cy="-58" r="5" fill="url(#premiumMetal)" stroke="#64748b" strokeWidth="1">
              <animate attributeName="r" values="5;6;5" dur="2s" repeatCount="indefinite"/>
            </circle>
            
            {/* Antenna Tip - Glowing Core */}
            <circle cx="0" cy="-65" r="7" fill="url(#electricBlue)" filter="url(#premiumGlow)">
              <animate attributeName="r" values="7;9;7" dur="1.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="0" cy="-65" r="4" fill="#67e8f9" filter="url(#premiumGlow)">
              <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" begin="0.2s"/>
            </circle>
            
            {/* Signal Waves */}
            <g className="signal-waves" stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round">
              <path d="M-12 -65 Q-18 -70 -12 -75">
                <animate attributeName="opacity" values="0;0.5;0" dur="1.5s" repeatCount="indefinite"/>
              </path>
              <path d="M12 -65 Q18 -70 12 -75">
                <animate attributeName="opacity" values="0;0.5;0" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
              </path>
              <path d="M0 -65 Q0 -73 0 -80" strokeWidth="2">
                <animate attributeName="opacity" values="0;0.6;0" dur="1.5s" repeatCount="indefinite" begin="0.25s"/>
              </path>
            </g>
          </g>
          
          {/* Head - Main Shape with Premium Metal Finish */}
          <rect x="12" y="16" width="104" height="80" rx="28" fill="url(#premiumMetal)" stroke="#64748b" strokeWidth="1.5" filter="url(#innerDepth)"/>
          
          {/* Head Highlight Reflections */}
          <rect x="18" y="20" width="92" height="20" rx="20" fill="url(#premiumMetal)" opacity="0.3" filter="url(#softShadow)"/>
          <ellipse cx="64" cy="30" rx="35" ry="8" fill="#f8fafc" opacity="0.15" filter="url(#softShadow)"/>
          
          {/* Face Plate - Dark Chrome */}
          <rect x="22" y="26" width="84" height="62" rx="22" fill="url(#darkChrome)" stroke="#334155" strokeWidth="1.5"/>
          
          {/* Face Plate Highlight */}
          <rect x="28" y="30" width="72" height="12" rx="10" fill="#475569" opacity="0.2"/>
          
          {/* Left Eye Assembly */}
          <g className="eye-left" transform="translate(50, 58)">
            {/* Eye Socket */}
            <ellipse cx="0" cy="0" rx="18" ry="20" fill="#020617" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Eye Outer Ring */}
            <ellipse cx="0" cy="0" rx="14" ry="15" fill="none" stroke="url(#electricBlue)" strokeWidth="1.5" opacity="0.6"/>
            
            {/* Eye Lens - Dynamic */}
            <ellipse cx="0" cy="-1" rx="11" ry="12" fill="url(#electricBlue)" filter="url(#premiumGlow)">
              <animate attributeName="ry" values="12;2;12" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0.85;1" dur="3s" repeatCount="indefinite"/>
            </ellipse>
            
            {/* Pupil Core */}
            <ellipse cx="-2" cy="-2" rx="4" ry="4" fill="#67e8f9" filter="url(#premiumGlow)">
              <animate attributeName="cx" values="-2;2;-2" dur="4s" repeatCount="indefinite"/>
            </ellipse>
            
            {/* Specular Highlights */}
            <ellipse cx="-4" cy="-5" rx="2.5" ry="2.5" fill="#67e8f9" opacity="0.9"/>
            <ellipse cx="4" cy="6" rx="1.5" ry="1.5" fill="#22d3ee" opacity="0.6"/>
            
            {/* Eye Glint Animation */}
            <ellipse cx="-6" cy="-6" rx="1.5" ry="1.5" fill="#fff" opacity="0.8">
              <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>
            </ellipse>
          </g>
          
          {/* Right Eye Assembly */}
          <g className="eye-right" transform="translate(78, 58)">
            <ellipse cx="0" cy="0" rx="18" ry="20" fill="#020617" stroke="#1e293b" strokeWidth="2"/>
            <ellipse cx="0" cy="0" rx="14" ry="15" fill="none" stroke="url(#electricBlue)" strokeWidth="1.5" opacity="0.6"/>
            <ellipse cx="0" cy="-1" rx="11" ry="12" fill="url(#electricBlue)" filter="url(#premiumGlow)">
              <animate attributeName="ry" values="12;2;12" dur="4s" repeatCount="indefinite" begin="0.2s"/>
              <animate attributeName="opacity" values="1;0.85;1" dur="3s" repeatCount="indefinite" begin="0.2s"/>
            </ellipse>
            <ellipse cx="-2" cy="-2" rx="4" ry="4" fill="#67e8f9" filter="url(#premiumGlow)">
              <animate attributeName="cx" values="-2;2;-2" dur="4s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="-4" cy="-5" rx="2.5" ry="2.5" fill="#67e8f9" opacity="0.9"/>
            <ellipse cx="4" cy="6" rx="1.5" ry="1.5" fill="#22d3ee" opacity="0.6"/>
            <ellipse cx="-6" cy="-6" rx="1.5" ry="1.5" fill="#fff" opacity="0.8">
              <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1.5s"/>
            </ellipse>
          </g>
          
          {/* Ear Pods - Side Modules */}
          <g className="ear-pods">
            <g transform="translate(8, 56)">
              <rect x="0" y="0" width="14" height="42" rx="7" fill="url(#premiumMetal)" stroke="#64748b" strokeWidth="1" filter="url(#innerDepth)">
                <animate attributeName="x" values="0;-3;0" dur="3s" repeatCount="indefinite"/>
              </rect>
              <circle cx="7" cy="21" r="4" fill="url(#electricBlue)" filter="url(#premiumGlow)">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <rect x="3" y="6" width="8" height="4" rx="2" fill="#334155" opacity="0.5"/>
              <rect x="3" y="14" width="8" height="4" rx="2" fill="#334155" opacity="0.5"/>
              <rect x="3" y="28" width="8" height="4" rx="2" fill="#334155" opacity="0.5"/>
            </g>
            <g transform="translate(106, 56)">
              <rect x="0" y="0" width="14" height="42" rx="7" fill="url(#premiumMetal)" stroke="#64748b" strokeWidth="1" filter="url(#innerDepth)">
                <animate attributeName="x" values="0;3;0" dur="3s" repeatCount="indefinite"/>
              </rect>
              <circle cx="7" cy="21" r="4" fill="url(#electricBlue)" filter="url(#premiumGlow)">
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <rect x="3" y="6" width="8" height="4" rx="2" fill="#334155" opacity="0.5"/>
              <rect x="3" y="14" width="8" height="4" rx="2" fill="#334155" opacity="0.5"/>
              <rect x="3" y="28" width="8" height="4" rx="2" fill="#334155" opacity="0.5"/>
            </g>
          </g>
          
          {/* Ear Pod Status Lights */}
          <circle cx="15" cy="77" r="3.5" fill="url(#electricBlue)" filter="url(#premiumGlow)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="113" cy="77" r="3.5" fill="url(#electricBlue)" filter="url(#premiumGlow)">
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          
          {/* Mouth / Voice Visualizer */}
          <g className="mouth-visualizer" transform="translate(64, 84)">
            <rect x="-18" y="0" width="36" height="8" rx="4" fill="#020617" stroke="#1e293b" strokeWidth="1.5"/>
            
            {/* Equalizer Bars - Animated */}
            <g className="eq-bars">
              <rect x="-14" y="1" width="4" height="6" rx="1" fill="url(#electricBlue)" filter="url(#premiumGlow)">
                <animate attributeName="height" values="6;12;6;8;10;6" dur="0.4s" repeatCount="indefinite"/>
                <animate attributeName="y" values="1;-5;1;-3;-1;1" dur="0.4s" repeatCount="indefinite"/>
              </rect>
              <rect x="-8" y="1" width="4" height="6" rx="1" fill="url(#electricBlue)" filter="url(#premiumGlow)">
                <animate attributeName="height" values="6;10;6;12;6" dur="0.4s" repeatCount="indefinite" begin="0.05s"/>
                <animate attributeName="y" values="1;-3;1;-5;1" dur="0.4s" repeatCount="indefinite" begin="0.05s"/>
              </rect>
              <rect x="-2" y="1" width="4" height="6" rx="1" fill="url(#electricBlue)" filter="url(#premiumGlow)">
                <animate attributeName="height" values="6;8;6;10;6" dur="0.4s" repeatCount="indefinite" begin="0.1s"/>
                <animate attributeName="y" values="1;-1;1;-3;1" dur="0.4s" repeatCount="indefinite" begin="0.1s"/>
              </rect>
              <rect x="4" y="1" width="4" height="6" rx="1" fill="url(#electricBlue)" filter="url(#premiumGlow)">
                <animate attributeName="height" values="6;12;6;8;10;6" dur="0.4s" repeatCount="indefinite" begin="0.15s"/>
                <animate attributeName="y" values="1;-5;1;-3;-1;1" dur="0.4s" repeatCount="indefinite" begin="0.15s"/>
              </rect>
              <rect x="10" y="1" width="4" height="6" rx="1" fill="url(#electricBlue)" filter="url(#premiumGlow)">
                <animate attributeName="height" values="6;10;6;12;6" dur="0.4s" repeatCount="indefinite" begin="0.2s"/>
                <animate attributeName="y" values="1;-3;1;-5;1" dur="0.4s" repeatCount="indefinite" begin="0.2s"/>
              </rect>
            </g>
          </g>
          
          {/* Chin / Jaw Detail */}
          <path d="M40 102 Q64 112 88 102" stroke="#475569" strokeWidth="2" fill="none" opacity="0.6"/>
          <ellipse cx="64" cy="100" rx="8" ry="3" fill="#1e293b" opacity="0.5"/>
          
          {/* Neck / Base Connection */}
          <g transform="translate(64, 100)">
            <rect x="-18" y="0" width="36" height="10" rx="3" fill="url(#premiumMetal)" stroke="#64748b" strokeWidth="1" filter="url(#innerDepth)"/>
            <circle cx="-12" cy="5" r="2.5" fill="#475569"/>
            <circle cx="12" cy="5" r="2.5" fill="#475569"/>
          </g>
          
          {/* Data Ports on Sides */}
          <g className="data-ports">
            <g transform="translate(4, 48)">
              <rect x="0" y="0" width="6" height="18" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
              <rect x="1" y="2" width="4" height="3" rx="1" fill="#0ea5e9" opacity="0.7">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
              </rect>
              <rect x="1" y="7" width="4" height="3" rx="1" fill="#0ea5e9" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.3s"/>
              </rect>
              <rect x="1" y="12" width="4" height="3" rx="1" fill="#0ea5e9" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.6s"/>
              </rect>
            </g>
            <g transform="translate(118, 48)">
              <rect x="0" y="0" width="6" height="18" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
              <rect x="1" y="2" width="4" height="3" rx="1" fill="#0ea5e9" opacity="0.7">
                <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
              </rect>
              <rect x="1" y="7" width="4" height="3" rx="1" fill="#0ea5e9" opacity="0.5">
                <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.3s"/>
              </rect>
              <rect x="1" y="12" width="4" height="3" rx="1" fill="#0ea5e9" opacity="0.5">
                <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.6s"/>
              </rect>
            </g>
          </g>
          
          {/* Holographic Projection Effect */}
          <g className="holo-projection" transform="translate(64, 64)" opacity="0.15">
            <circle cx="0" cy="0" r="40" fill="none" stroke="url(#electricBlue)" strokeWidth="1" strokeDasharray="8 4">
              <animate attributeName="r" values="40;50;40" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.15;0.3;0.15" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="0" cy="0" r="30" fill="none" stroke="url(#electricBlue)" strokeWidth="0.5" strokeDasharray="4 8">
              <animate attributeName="r" values="30;40;30" dur="3s" repeatCount="indefinite" begin="1.5s"/>
              <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite" begin="1.5s"/>
            </circle>
          </g>
        </svg>
        
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full border-3 border-sky-400/50 animate-ping" />
        
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