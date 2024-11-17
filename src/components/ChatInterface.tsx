import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Edit2, Trash2, X, Check, RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import { isConfigured } from '../config/env';
import { cn } from '../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  edited?: boolean;
}

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, editMessage, deleteMessage, clearHistory, isLoading, error, data } = useStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isConfigured()) {
      addMessage('Please configure your OpenAI API key in the .env file to use the chat functionality.', 'assistant');
      return;
    }

    if (data.length === 0) {
      addMessage('Please upload some data first to analyze.', 'assistant');
      return;
    }

    const userMessage = input;
    setInput('');
    addMessage(userMessage, 'user');

    try {
      const response = await useStore.getState().sendMessage(userMessage);
      addMessage(response, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Sorry, I encountered an error processing your request. Please try again later.', 'assistant');
    }
  };

  const startEditing = (message: Message) => {
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const saveEdit = (id: string) => {
    if (editContent.trim()) {
      editMessage(id, editContent.trim());
    }
    cancelEditing();
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(id);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the entire chat history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md p-4">
      {!isConfigured() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-yellow-700">
          <AlertCircle className="h-5 w-5" />
          <p>Please configure your OpenAI API key in the .env file.</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Chat History</h3>
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Clear History
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the social media data..."
          className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
          disabled={isLoading || !isConfigured() || data.length === 0}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !isConfigured() || data.length === 0}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-4 scrollbar-hide chat-container"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "group relative flex gap-2",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div className="max-w-[80%] relative">
              {editingId === message.id ? (
                <div className="flex gap-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 min-h-[100px]"
                    placeholder="Edit your message..."
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => saveEdit(message.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Save changes"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "rounded-lg p-3",
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    )}
                  >
                    {message.content}
                    {message.edited && (
                      <span className="text-xs ml-2 opacity-50">(edited)</span>
                    )}
                  </div>

                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1 -mt-8 bg-white rounded-lg shadow-lg p-1">
                      <button
                        onClick={() => startEditing(message)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit message"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}