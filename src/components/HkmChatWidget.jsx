import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';

// Helper to parse bold (**) and italic (*) syntax into React nodes with custom brand colors
const parseInlineStyles = (text, isAssistant) => {
  if (!text) return '';
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const tokens = text.split(regex);
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      const content = token.slice(2, -2);
      return (
        <strong key={index} className={`font-bold ${isAssistant ? 'text-[#561291]' : 'text-white'}`}>
          {content}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const content = token.slice(1, -1);
      return (
        <em key={index} className={`italic font-medium ${isAssistant ? 'text-slate-600' : 'text-white/90'}`}>
          {content}
        </em>
      );
    }
    return token;
  });
};

// Main rich text formatter supporting headers, bullet lists, and paragraphs
const renderRichText = (text, isAssistant) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const renderedElements = [];
  let listItems = [];
  let inList = false;
  
  const flushList = (key) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={key} className="list-none space-y-1.5 my-2 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Header block (### Heading)
    if (trimmed.startsWith('### ')) {
      flushList(`list-before-h-${index}`);
      const headingText = trimmed.slice(4);
      renderedElements.push(
        <h3 key={`h-${index}`} className={`text-base font-bold mt-4 mb-2 first:mt-0 flex items-center gap-1.5 leading-snug ${isAssistant ? 'text-[#561291]' : 'text-white'}`}>
          {parseInlineStyles(headingText, isAssistant)}
        </h3>
      );
    }
    // Bullet point (• or -)
    else if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      inList = true;
      const bulletText = trimmed.slice(2);
      listItems.push(
        <li key={`li-${index}`} className={`flex items-start gap-2 text-sm leading-relaxed ${isAssistant ? 'text-slate-700' : 'text-white/90'}`}>
          <span className={`${isAssistant ? 'text-[#561291]' : 'text-white'} shrink-0 mt-1 select-none`}>•</span>
          <span className="flex-1">{parseInlineStyles(bulletText, isAssistant)}</span>
        </li>
      );
    }
    // Numbered list item (e.g. 1. )
    else if (/^\d+\.\s/.test(trimmed)) {
      inList = true;
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      const num = match[1];
      const bulletText = match[2];
      listItems.push(
        <li key={`li-${index}`} className={`flex items-start gap-2 text-sm leading-relaxed ${isAssistant ? 'text-slate-700' : 'text-white/90'}`}>
          <span className={`${isAssistant ? 'text-[#561291]' : 'text-white'} shrink-0 font-bold text-xs mt-0.5 select-none`}>{num}.</span>
          <span className="flex-1">{parseInlineStyles(bulletText, isAssistant)}</span>
        </li>
      );
    }
    // Empty spacing
    else if (trimmed === '') {
      flushList(`list-before-blank-${index}`);
      renderedElements.push(<div key={`blank-${index}`} className="h-2" />);
    }
    // Regular text block
    else {
      flushList(`list-before-p-${index}`);
      renderedElements.push(
        <p key={`p-${index}`} className={`text-sm leading-relaxed my-1 ${isAssistant ? 'text-slate-700' : 'text-white'}`}>
          {parseInlineStyles(line, isAssistant)}
        </p>
      );
    }
  });
  
  flushList(`list-trailing`);
  
  return <div className="space-y-1">{renderedElements}</div>;
};

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
        .hkm-chat-toggle {
          background: linear-gradient(135deg, #d17d39 0%, #bd4f2a 100%) !important;
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
          transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .hkm-chat-toggle:hover {
          transform: translateZ(0) scale(1.05) !important;
          box-shadow: 0 10px 20px rgba(209, 125, 57, 0.3) !important;
        }
        .hkm-chat-toggle:active {
          transform: translateZ(0) scale(0.95) !important;
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
                  <span className="text-[10px] text-white/80 flex items-center gap-1">
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
                      {renderRichText(msg.text, msg.sender === 'assistant')}
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
        className="hkm-chat-toggle w-14 h-14 flex items-center justify-center text-white shadow-xl hover:shadow-2xl cursor-pointer animate-fade-in"
        style={{
          borderRadius: '9999px'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
