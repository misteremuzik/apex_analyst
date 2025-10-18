import { useState, useRef } from 'react';
import { Send, User, ExternalLink, Loader2 } from 'lucide-react';
import { marked } from 'marked';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    description: string;
  }>;
}

interface ChatAssistantProps {
  analysisId: string;
}

export function ChatAssistant({ analysisId }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm here to help you understand your AI readiness results and guide you through implementing the recommendations. Ask me anything about improving your website's AI compatibility!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          analysisId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-black p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-black text-2xl">owl</span>
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">AI Assistant</h2>
            <p className="text-sm text-gray-300">Ask questions about your results</p>
          </div>
        </div>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-black text-xl">owl</span>
              </div>
            )}

            <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                ) : (
                  <div
                    className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-headings:my-2 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-gray-800 prose-pre:bg-gray-100 prose-pre:text-gray-800"
                    dangerouslySetInnerHTML={{ __html: marked(message.content) }}
                  />
                )}
              </div>

              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 space-y-2 w-full">
                  <p className="text-xs font-medium text-gray-600">Helpful Resources:</p>
                  {message.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-400 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors truncate">
                              {source.title}
                            </h4>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-black flex-shrink-0" />
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{source.description}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-black text-xl">owl</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your recommendations..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Try asking: "How do I add structured data?" or "What should I prioritize?"
        </p>
      </form>
    </div>
  );
}
