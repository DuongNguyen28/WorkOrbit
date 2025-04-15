'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I assist you today?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = { text: data.response, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { text: "Sorry, something went wrong.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 bg-[#003459] text-white p-3 rounded-full shadow-lg z-50 focus:outline-none hover:bg-[#0041a8] transition-colors"
      >
        <span role="img" aria-label="chat">✉</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            className="fixed bottom-20 right-4 w-full max-w-md h-[30rem] bg-[#2f3b4c] shadow-lg rounded-lg flex flex-col z-50 animate-pulse-shadow"
          >
            <div className="bg-[#2f3b4c] text-white p-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0052cc] rounded-full flex items-center justify-center">
                  🤖
                </div>
                <div>
                  <div className="font-semibold">AI Assistant</div>
                  <div className="text-xs text-gray-400">Online • Ready to help</div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 bg-[#0052cc] rounded-full flex items-center justify-center mr-2 mt-1">
                      🤖
                    </div>
                  )}
                  <div
                    className={`p-2 rounded-lg max-w-[80%] ${
                      msg.sender === 'user'
                        ? 'bg-[#0052cc] text-white'
                        : 'bg-[#3f4b5c] text-white'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && <p className="text-gray-400 text-sm">Bot is typing...</p>}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="p-3 border-t border-gray-600">
              <div className="flex gap-2 mb-2 justify-center">
                <button className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-full text-sm hover:bg-gray-700 transition-colors">
                  <span>🔍</span> Search Documents
                </button>
                <button className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-full text-sm hover:bg-gray-700 transition-colors">
                  <span>🌐</span> Translate
                </button>
                <button className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-full text-sm hover:bg-gray-700 transition-colors">
                  <span>❓</span> Help
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="w-full p-2 bg-[#3f4b5c] text-white rounded-full focus:outline-none placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  className="w-8 h-8 bg-[#0052cc] rounded-full flex items-center justify-center hover:bg-[#0041a8] transition-colors"
                >
                  <span>➤</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;