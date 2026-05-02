import { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../App';
import { X, Send, Sparkles, User, Bot, Loader2, Info, MessageCircle, UserCircle2 } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import AIInfoTooltip from './AIInfoTooltip';

// Counter to ensure unique message IDs
let messageCounter = 0;

interface AICareerAssistantProps {
  userProfile: UserProfile;
  language: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AICareerAssistant({ userProfile, language }: AICareerAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [talkingToHuman, setTalkingToHuman] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        id: (messageCounter++).toString(),
        role: 'assistant',
        content: `Hello ${userProfile.name}! I'm your AI Career Assistant. I can help you find apprenticeships, improve your profile, and plan your career path. How can I assist you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const handleTalkToHuman = () => {
    setTalkingToHuman(true);
    const humanMessage: Message = {
      id: (messageCounter++).toString(),
      role: 'assistant',
      content: `✅ You've been connected to our human support team!\n\nA support agent will be with you shortly. In the meantime, you can describe your question or concern, and our team will respond as soon as possible.\n\n🕒 Average response time: 5-10 minutes\n📧 You'll also receive updates via email at ${userProfile.email || 'your registered email'}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, humanMessage]);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Find apprenticeships
    if (lowerMessage.includes('apprentice') || lowerMessage.includes('job') || lowerMessage.includes('find')) {
      return `Based on your skills (${userProfile.skills.slice(0, 3).join(', ')}), I recommend checking the Jobs tab for personalized matches. You have ${userProfile.skills.length} skills which match well with IT, hospitality, and construction apprenticeships. Your top match is currently at 95%!`;
    }
    
    // Improve profile
    if (lowerMessage.includes('improve') || lowerMessage.includes('profile') || lowerMessage.includes('better')) {
      const suggestions = [];
      if (!userProfile.experience || userProfile.experience.length === 0) {
        suggestions.push('Add your work experience to strengthen your profile');
      }
      if (!userProfile.education || userProfile.education.length === 0) {
        suggestions.push('Add your education background');
      }
      if (userProfile.skills.length < 5) {
        suggestions.push('Add more skills to increase job matches');
      }
      if (!userProfile.phone || !userProfile.email) {
        suggestions.push('Complete your contact information');
      }
      
      if (suggestions.length > 0) {
        return `Here are AI-generated suggestions to improve your profile:\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nThese improvements will increase your visibility to employers by up to 60%!`;
      }
      return 'Your profile looks great! You have all the essential information. Consider adding more specific skills or certifications to stand out even more.';
    }
    
    // Skills to learn
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('study')) {
      return `Based on current job market trends and your profile, I recommend learning:\n\n1. **German Language B1** - 85% of local apprenticeships require German\n2. **Digital Skills** - Basic computer skills are needed in 90% of jobs\n3. **Soft Skills** - Communication and teamwork are highly valued\n\nCheck the Learn tab for relevant courses! I've found 12 courses that match your needs.`;
    }
    
    // CV help
    if (lowerMessage.includes('cv') || lowerMessage.includes('resume')) {
      return `I can help you create a professional CV! Here's what I suggest:\n\n✓ Your current skills are well-documented\n✓ Add 2-3 work experiences for stronger impact\n✓ Include any certificates or training\n\nYou can download your CV as PDF from the Profile tab. I've analyzed 1000+ successful CVs, and yours has strong potential!`;
    }
    
    // Default response
    return `I'm here to help with:\n• Finding apprenticeships matched to your skills\n• Improving your profile and CV\n• Recommending courses and skills to learn\n• Career guidance and planning\n\nWhat would you like to know more about?`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: (messageCounter++).toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (messageCounter++).toString(),
        role: 'assistant',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 z-50 flex items-center gap-2 group"
      >
        <MessageCircle className="w-6 h-6" />
        <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          AI Assistant
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 text-gray-900 p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">AI Career Assistant</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Online
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1 text-xs text-blue-600">
                  <Bot className="w-3 h-3" />
                  <span>AI Assistant</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 shadow-sm rounded-xl p-3 max-w-[80%]">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Talk to Human Option */}
      <div className="px-4 py-2 bg-blue-50 border-t border-gray-200">
        <button 
          onClick={handleTalkToHuman}
          disabled={talkingToHuman}
          className={`w-full flex items-center justify-center gap-2 text-sm py-2 px-3 rounded-lg transition-colors ${
            talkingToHuman 
              ? 'bg-green-100 text-green-700 cursor-not-allowed' 
              : 'text-blue-700 hover:text-blue-800 hover:bg-blue-100'
          }`}
        >
          <UserCircle2 className="w-4 h-4" />
          <span>{talkingToHuman ? '✓ Connected to Human Support' : 'Talk to a Human Support Agent'}</span>
        </button>
      </div>

      {/* Example Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 bg-white">
          <p className="text-xs text-gray-600 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'How can I improve my profile?',
              'What skills should I learn?',
              'Help me find apprenticeships',
            ].map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(prompt)}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors border border-gray-300"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}