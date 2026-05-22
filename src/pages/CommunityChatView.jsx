import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Send, Pin, Users, User, ArrowLeft,
  Circle, Smile, Image, Paperclip, MessageSquare
} from 'lucide-react';
import HkmChatWidget from '@/components/HkmChatWidget';

export default function CommunityChatView() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  const [activeChannel, setActiveChannel] = useState('general');
  const [messageText, setMessageText] = useState('');

  // Initial Chat Feed State
  const [channels, setChannels] = useState({
    general: {
      name: 'general',
      topic: 'Generell faglig og sosial diskusjon for alle studenter',
      pinned: {
        author: 'Dr. Julian Vance (Lærer)',
        text: 'Husk å sjekke leksjonsmodulene i Pedagogikk (PED 101) før Zoom-seminaret i morgen kveld kl. 18:00. Vi skal diskutere didaktiske metoder i praksis.',
        time: 'I går'
      },
      messages: [
        {
          id: 1,
          author: 'Marius Holm',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
          text: 'Hei alle sammen! Er det noen andre som tar PED 101 dette semesteret? Tenkte å starte en kollokviegruppe på biblioteket til fredag.',
          time: '10:15',
          role: 'Student'
        },
        {
          id: 2,
          author: 'Ingrid Nilsen',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
          text: 'Ja, gjerne Marius! Jeg sliter litt med didaktikk-modulen og vil gjerne sparre litt før innleveringen.',
          time: '10:24',
          role: 'Student'
        },
        {
          id: 3,
          author: 'Anders Berg',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
          text: 'Teller meg med på den! Skal vi møtes rundt kl 12:00?',
          time: '10:31',
          role: 'Student'
        }
      ]
    },
    'study-groups': {
      name: 'study-groups',
      topic: 'Organisering av studiegrupper og kollokvier',
      pinned: {
        author: 'Elena Rodriguez (Faglærer)',
        text: 'For Akademisk Skriving anbefaler jeg sterkt at studiegrupper gjør fagfellevurdering (peer-review) på utkastene til prosjektskissene deres.',
        time: '2 dager siden'
      },
      messages: [
        {
          id: 1,
          author: 'Anders Berg',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
          text: 'Noen som er ledige for kildekritikk-diskusjon i dag? Er på grupperom 4.',
          time: '09:05',
          role: 'Student'
        }
      ]
    },
    'physics-seminar': {
      name: 'physics-seminar',
      topic: 'Faglige samtaler rundt Advanced Theoretical Physics',
      pinned: null,
      messages: [
        {
          id: 1,
          author: 'Dr. Alistair Thorne (Lærer)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
          text: 'Bølgefunksjonsoppgaven krever grundig matematisk redegjørelse av degenerasjonsgraden. Ikke hopp over leddene i utledningen.',
          time: 'I dag 08:30',
          role: 'Lærer'
        }
      ]
    }
  });

  const [onlineMembers] = useState([
    { name: 'Dr. Julian Vance', role: 'Lærer', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120', online: true },
    { name: 'Anders Berg', role: 'Student', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120', online: true },
    { name: 'Ingrid Nilsen', role: 'Student', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', online: true },
    { name: 'Marius Holm', role: 'Student', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', online: false },
    { name: 'Dr. Alistair Thorne', role: 'Lærer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120', online: false }
  ]);

  const activeChannelData = channels[activeChannel];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      id: Date.now(),
      author: user?.name || 'Gjestestudent',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      text: messageText,
      time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
      role: user?.role === 'teacher' ? 'Lærer' : (user?.role === 'admin' ? 'Admin' : 'Student')
    };

    setChannels(prev => ({
      ...prev,
      [activeChannel]: {
        ...prev[activeChannel],
        messages: [...prev[activeChannel].messages, newMsg]
      }
    }));

    setMessageText('');
    showToast("Melding postet i fellesskapet!");
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-background">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 text-on-surface-variant hover:text-primary"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="font-serif text-2xl font-bold text-primary">Scholastic Premium</div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary px-3 py-1 bg-surface-container rounded-full flex items-center gap-1.5">
              <Circle size={8} className="fill-green-500 text-green-500 animate-pulse" /> Fellesskap
            </span>
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full border-2 border-primary-container shadow"
            />
          </div>
        </div>
      </header>

      {/* Grid Container */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left column: Channel Selector */}
        <div className="w-full lg:w-3/12 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <MessageSquare size={18} /> Kanalkatalog
            </h3>
            
            <div className="space-y-1">
              {[
                { id: 'general', name: 'general', desc: 'Hovedchaten' },
                { id: 'study-groups', name: 'study-groups', desc: 'Kollokvieorganisering' },
                { id: 'physics-seminar', name: 'physics-seminar', desc: 'Advanced Physics' }
              ].map(ch => {
                const isActive = activeChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200 active:scale-[0.98] ${
                      isActive 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-transparent hover:bg-surface-container-low text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <Hash size={18} className={isActive ? 'text-white' : 'text-outline'} />
                    <div>
                      <p className="text-sm font-bold">#{ch.name}</p>
                      <p className={`text-[10px] ${isActive ? 'text-on-primary-container/85' : 'text-outline'}`}>
                        {ch.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center column: Main Chat Area */}
        <div className="w-full lg:w-6/12 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm flex flex-col h-[650px]">
            {/* Active Channel Header */}
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
              <div>
                <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-1.5">
                  <Hash size={18} className="text-secondary" /> {activeChannelData.name}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">{activeChannelData.topic}</p>
              </div>
            </div>

            {/* Message Feed Area */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6">
              
              {/* Pinned Announcement Block */}
              {activeChannelData.pinned && (
                <div className="bg-surface-container border border-outline-variant p-4 rounded-lg flex items-start gap-3 shadow-inner">
                  <Pin size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Nålfestet av {activeChannelData.pinned.author}</span>
                      <span className="text-[10px] text-outline">{activeChannelData.pinned.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-serif">
                      "{activeChannelData.pinned.text}"
                    </p>
                  </div>
                </div>
              )}

              {/* Chat Stream Messages */}
              <div className="space-y-5">
                {activeChannelData.messages.map(msg => (
                  <div key={msg.id} className="flex gap-4 items-start group">
                    <img 
                      src={msg.avatar} 
                      alt={msg.author} 
                      className="w-10 h-10 rounded-full border border-outline-variant shadow-sm flex-shrink-0"
                    />
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">{msg.author}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          msg.role === 'Lærer' 
                            ? 'bg-primary text-white' 
                            : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {msg.role}
                        </span>
                        <span className="text-[10px] text-outline ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          {msg.time}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Trigger Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant bg-surface-container-low/40 form-field-stable">
              <div className="relative flex items-center bg-white border border-outline-variant rounded-lg p-2 focus-within:border-primary transition-all">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Skriv en melding til #${activeChannelData.name}...`}
                  className="flex-grow bg-transparent text-xs p-2 focus:outline-none placeholder:text-outline"
                />
                
                {/* Actions */}
                <div className="flex items-center gap-1.5 px-2">
                  <button type="button" className="p-1.5 hover:bg-surface-container rounded-full text-outline hover:text-primary transition-colors">
                    <Smile size={16} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-surface-container rounded-full text-outline hover:text-primary transition-colors">
                    <Paperclip size={16} />
                  </button>
                  <button 
                    type="submit" 
                    className="p-2 bg-primary text-white rounded-full hover:bg-primary-container active:scale-95 transition-all shadow-md"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: Online Members List */}
        <div className="w-full lg:w-3/12 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Users size={18} /> Deltakere ({onlineMembers.length})
            </h3>
            
            <div className="space-y-3">
              {onlineMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-8 h-8 rounded-full border border-outline-variant shadow-sm"
                      />
                      {member.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary leading-tight">{member.name}</p>
                      <p className="text-[9px] text-outline font-semibold uppercase">{member.role}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold ${member.online ? 'text-green-600' : 'text-outline'}`}>
                    {member.online ? 'Tilstede' : 'Frakoblet'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating HKM Chat Widget */}
      <HkmChatWidget />
    </div>
  );
}
