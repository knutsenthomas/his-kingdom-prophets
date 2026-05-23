import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';

export default function HkmChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const { assistantMessages, isAssistantTyping, sendAssistantMessage } = useApp();
  const chatBodyRef = useRef(null);

  // Trigger smooth scroll when messages change or typing status changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const body = chatBodyRef.current;
        if (!body) return;

        // Find all message items, excluding the typing dot placeholder
        const messages = body.querySelectorAll('.hkm-message:not(.typing)');
        if (messages && messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          // AI answer scrolls to top of message (lastMsg.offsetTop - 10)
          body.scrollTo({
            top: lastMsg.offsetTop - 10,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [assistantMessages, isAssistantTyping, isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('hkm-open-chat', handleOpen);
    return () => window.removeEventListener('hkm-open-chat', handleOpen);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    sendAssistantMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99] font-sans">
      {/* Chrome Jitter Fix Layer Isolation stylesheet */}
      <style>{`
        .hkm-chat-panel {
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
        }
        .hkm-chat-panel input {
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
        }
        .hkm-chat-body {
          position: relative !important;
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="hkm-chat-panel bg-white w-[360px] h-[500px] rounded-2xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden mb-4"
          >
            {/* Header - Deep Brand Blue */}
            <div className="bg-[#1B4965] text-white px-5 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <img 
                  src={logo} 
                  alt="HKM Logo" 
                  className="w-8 h-8 object-contain shrink-0"
                />
                <div>
                  <h3 className="font-semibold text-sm">HKM Assistent</h3>
                  <span className="text-[10px] text-on-primary-container/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 inline-block animate-pulse" style={{ borderRadius: '9999px' }}></span>
                    Tilkoblet plattformen
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                style={{ borderRadius: '9999px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages Body - Scroll container with offset context */}
            <div 
              ref={chatBodyRef}
              className="hkm-chat-body flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50"
            >
              {assistantMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`hkm-message flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                >
                  {msg.sender !== 'user' && (
                    <img 
                      src={logo} 
                      alt="HKM Logo" 
                      className="w-7 h-7 object-contain shrink-0 self-start mt-0.5" 
                    />
                  )}
                  <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-on-surface border border-outline-variant/60 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-outline mt-1 px-1 font-mono">{msg.time}</span>
                  </div>
                </div>
              ))}

              {/* Typing Dot Animation */}
              {isAssistantTyping && (
                <div className="hkm-message typing flex gap-2 mr-auto justify-start max-w-[85%]">
                  <img 
                    src={logo} 
                    alt="HKM Logo" 
                    className="w-7 h-7 object-contain shrink-0 self-start mt-0.5" 
                  />
                  <div className="flex flex-col items-start">
                    <div className="px-4 py-3 rounded-2xl bg-white border border-outline-variant/60 rounded-tl-none flex items-center shadow-sm">
                      <div className="hkm-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form - Strict block layout to avoid jitter */}
            <form 
              onSubmit={handleSubmit}
              className="p-3 bg-white border-t border-outline-variant"
              style={{ display: 'block' }}
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Skriv din melding her..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-on-surface"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary-container disabled:text-outline/40 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button - Circular SVG with Orange Gradient */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer animate-fade-in"
        style={{
          borderRadius: '9999px',
          backgroundImage: 'linear-gradient(135deg, #d17d39 0%, #bd4f2a 100%)',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
