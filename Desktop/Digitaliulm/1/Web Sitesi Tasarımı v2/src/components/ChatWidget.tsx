import { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface ChatWidgetProps {
  lang: 'tr' | 'de' | 'en';
}

export function ChatWidget({ lang }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, sender: 'bot' | 'user'}>>([]);
  const [inputValue, setInputValue] = useState('');

  const translations = {
    tr: {
      initialMessage: 'Sayfamızı incelediğinizi görüyoruz, size nasıl yardımcı olabiliriz?',
      placeholder: 'Mesajınızı yazın...',
      send: 'Gönder',
      typing: 'Yazıyor...',
    },
    de: {
      initialMessage: 'Wir sehen, dass Sie unsere Seite besuchen. Wie können wir Ihnen helfen?',
      placeholder: 'Schreiben Sie Ihre Nachricht...',
      send: 'Senden',
      typing: 'Tippt...',
    },
    en: {
      initialMessage: 'We see you\'re exploring our page, how can we help you?',
      placeholder: 'Type your message...',
      send: 'Send',
      typing: 'Typing...',
    }
  };

  const t = translations[lang];

  const handleOpen = () => {
    setIsOpen(true);
    // Add initial message if no messages exist
    if (messages.length === 0) {
      setTimeout(() => {
        setMessages([{ text: t.initialMessage, sender: 'bot' }]);
      }, 500);
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, sender: 'user' }]);
      setInputValue('');
      
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: lang === 'tr' 
            ? 'Teşekkür ederiz! Ekibimiz en kısa sürede size dönüş yapacaktır.' 
            : lang === 'de'
            ? 'Vielen Dank! Unser Team wird sich in Kürze bei Ihnen melden.'
            : 'Thank you! Our team will get back to you shortly.',
          sender: 'bot' 
        }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll listener to show chat button when near bottom
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      
      // Show chat button when scrolled 80% of the page
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      setShowChat(scrollPercentage > 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Chat Button */}
      {showChat && (
        <button
          onClick={handleOpen}
          className="fixed bottom-8 right-8 z-50 bg-[#0EA5E9] text-white p-4 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_50px_rgba(14,165,233,0.6)] hover:scale-110 transition-all duration-300 group animate-slideUp"
          aria-label="Open chat"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 z-50 w-[380px] h-[500px] bg-[#1a1a1a] border border-[#0EA5E9]/30 rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.3)] flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] p-4 border-b border-[#0EA5E9]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0EA5E9] rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">digitalIulm</h3>
                <p className="text-xs text-gray-400">{t.typing}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-[#0EA5E9] text-white rounded-br-none'
                      : 'bg-white/10 text-white rounded-bl-none backdrop-blur-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#0EA5E9]/20 bg-[#1a1a1a]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#0EA5E9]/50 transition-colors"
              />
              <button
                onClick={handleSend}
                className="bg-[#0EA5E9] text-white p-2 rounded-full hover:scale-110 transition-transform"
                aria-label={t.send}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}