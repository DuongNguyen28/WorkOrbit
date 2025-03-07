'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome to WorkOrbit. Hello, how can I help you today?", sender: "bot" }
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
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-[#003459] text-white p-3 rounded-full shadow-lg z-50 focus:outline-none"
      >
        {isOpen ? 'Close Chat' : 'Chat'}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-full max-w-sm md:max-w-md h-[28rem] bg-white shadow-lg rounded-lg flex flex-col z-50">
          <div className="bg-[#003459] text-white p-3 rounded-t-lg">Chatbot</div>
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-2 rounded max-w-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#003459] text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-gray-500 text-sm">Bot is typing...</p>}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="p-3 border-t">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="w-full p-2 border rounded focus:outline-none"
              disabled={loading}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;