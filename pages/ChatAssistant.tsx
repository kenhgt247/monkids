import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getOpenAIResponse } from '../services/openaiService';
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import Button from '../components/Button';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Chào mẹ! Mình là "Mẹ Thông Thái" AI. Bạn có câu hỏi gì về chăm sóc bé hay cần mình kể chuyện không?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simple heuristic to switch context
    const context = input.toLowerCase().includes('kể chuyện') || input.toLowerCase().includes('câu chuyện') 
        ? 'kids_story' 
        : 'parenting';

    // Gọi API OpenAI thay vì Gemini
    const responseText = await getOpenAIResponse([...messages, userMsg], context);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 flex items-center text-white">
        <div className="bg-white/20 p-2 rounded-full mr-3">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg font-heading">Trợ lý Mẹ Thông Thái</h3>
          <p className="text-primary-100 text-xs">Được hỗ trợ bởi ChatGPT (OpenAI)</p>
        </div>
        <Sparkles className="ml-auto text-yellow-300 animate-pulse" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
            }`}>
              <div className="flex items-start gap-2">
                 {msg.role === 'model' && <Bot size={16} className="mt-1 text-primary-500 shrink-0" />}
                 <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{msg.text}</div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi về cách chăm bé, hoặc 'kể chuyện cổ tích'..."
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-sans"
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading} size="sm" className="w-12 h-10 !rounded-full !px-0 flex items-center justify-center">
            <Send size={18} />
          </Button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2 font-sans">
          AI có thể mắc lỗi. Hãy tham khảo ý kiến chuyên gia y tế cho các vấn đề sức khỏe.
        </p>
      </div>
    </div>
  );
};

export default ChatAssistant;