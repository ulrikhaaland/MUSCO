import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PopupOption, ChatMessage } from '../../types';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPart: string;
  position: { x: number; y: number };
}

const defaultOptions: PopupOption[] = [
  { id: 'learn', label: 'Learn more' },
  { id: 'issue', label: 'I have an issue' },
  { id: 'option3', label: 'Option 3' },
  { id: 'option4', label: 'Option 4' },
];

export default function Popup({ isOpen, onClose, selectedPart, position }: PopupProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleOptionClick = (option: PopupOption) => {
    // TODO: Handle option click and integrate with OpenAI
    console.log(`Selected option: ${option.label} for part: ${selectedPart}`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    // TODO: Send message to OpenAI and handle response
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bg-[#1e293b] rounded-lg shadow-xl p-4 min-w-[300px] max-w-[400px]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{selectedPart}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {defaultOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className="w-full text-left px-4 py-2 rounded bg-indigo-600/20 hover:bg-indigo-600/30 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="max-h-[300px] overflow-y-auto mb-4 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded ${
                  message.role === 'user' ? 'bg-indigo-600/20 ml-4' : 'bg-gray-600/20 mr-4'
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#0f172a] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 transition-colors"
            >
              Send
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 