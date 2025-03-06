'use client';

import React, { useState } from 'react';

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

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    // Append the user message to the chat
    setMessages((prev) => [...prev, { text: inputValue, sender: "user" }]);
    setInputValue('');
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-[#003459] text-white p-3 rounded-full shadow-lg z-50 focus:outline-none"
      >
        {isOpen ? 'Close Chat' : 'Chat'}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-full max-w-xs md:max-w-sm h-96 bg-white shadow-lg rounded-lg flex flex-col z-50">
          <div className="bg-[#003459] text-white p-3 rounded-t-lg">
            Chatbot
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet.</p>
            ) : (
              messages.map((msg, index) => (
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
              ))
            )}
          </div>
          <div className="p-3 border-t">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Type your message..."
              className="w-full p-2 border rounded focus:outline-none"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
