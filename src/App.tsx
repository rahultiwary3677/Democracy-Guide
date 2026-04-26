import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { Send, User, Info, Moon, Sun } from 'lucide-react';
import './App.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
You are 'Democracy Guide', an interactive, friendly, and neutral assistant designed to help voters understand the election process, timelines, and necessary steps to participate.
Your primary vertical is: 'Election Information and Voter Guidance'.
Your goal is to provide clear, concise, and accessible information formatted beautifully in Markdown.
`;

const SUGGESTED_PROMPTS = [
  "How do I register to vote?",
  "What ID do I need to vote?",
  "When is the next election?"
];

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      text: "Hello! I'm **Democracy Guide**. How can I help you understand the election process today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark for cool look
  const isConfigured = !!API_KEY;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [input]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = typeof textToSend === 'string' ? textToSend : input;
    if (!text.trim() || !isConfigured) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (text === input) setInput('');
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT
      });

      const validMessages = messages.filter(msg => msg.id !== 'welcome-msg' && !msg.text.includes("error"));
      const firstUserIdx = validMessages.findIndex(m => m.sender === 'user');
      const historyToUse = firstUserIdx >= 0 ? validMessages.slice(firstUserIdx) : [];

      const history = historyToUse.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({
        history: history,
        generationConfig: { maxOutputTokens: 1000 },
      });

      const result = await chat.sendMessage(userMessage.text);
      const responseText = result.response.text();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I encountered an error trying to process that. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>Democracy Guide</h1>
        </div>
        <button 
          className="theme-toggle" 
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="chat-container" role="main">
        {!isConfigured && (
          <div className="config-warning" role="alert">
            <Info size={24} />
            <div>
              <h3>API Key Missing</h3>
              <p>Please add <code>VITE_GEMINI_API_KEY</code> to your environment variables.</p>
            </div>
          </div>
        )}

        <div className="messages-area" aria-live="polite">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`message-wrapper ${message.sender}`}
              >
                {message.sender === 'bot' && (
                  <div className="message-avatar">
                    <img src="/avatar.png" alt="Bot Avatar" />
                  </div>
                )}
                
                <div className="message-bubble">
                  {message.sender === 'bot' ? (
                    <div className="markdown-content">
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>

                {message.sender === 'user' && (
                  <div className="message-avatar" style={{ background: 'var(--primary)' }}>
                    <User size={20} color="white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="message-wrapper bot"
            >
              <div className="message-avatar">
                <img src="/avatar.png" alt="Bot Avatar" />
              </div>
              <div className="message-bubble">
                <div className="loading-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container-wrapper">
            
            {!isLoading && messages.length < 3 && (
              <motion.div 
                className="quick-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button 
                    key={idx} 
                    className="quick-action-btn"
                    onClick={() => handleSendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </motion.div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="input-form">
              <label htmlFor="chat-input" className="visually-hidden">Type your question here</label>
              <textarea
                id="chat-input"
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Democracy Guide..."
                disabled={isLoading || !isConfigured}
                rows={1}
                aria-label="Chat input"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading || !isConfigured}
                aria-label="Send message"
                className="send-button"
              >
                <Send size={20} />
              </button>
            </form>
            <div className="input-footer">
              Democracy Guide may display inaccurate info, so double-check important dates.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
