import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X } from "lucide-react";
import { cn } from '@/lib/utils';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: 'Hello! I can help you with placement policy questions. What would you like to know?', sender: 'bot' }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('https://placement-plolicy-chatbot-api-3.onrender.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        text: data.answer || "Sorry, I couldn't process that request.", 
        sender: 'bot' as const 
      }]);
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I couldn't connect to the server. Please try again later.", 
        sender: 'bot' as const 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen ? (
        <Button 
          variant="default" 
          className="fixed bottom-5 right-5 rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg z-50" 
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="fixed bottom-5 right-5 w-80 sm:w-96 h-[500px] shadow-xl flex flex-col overflow-hidden rounded-lg border z-50">
          {/* Chat Header */}
          <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
            <h3 className="font-semibold">Placement Policy Chatbot</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Messages Container */}
          <div className="flex-grow overflow-y-auto p-4 bg-secondary/30 flex flex-col gap-3">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  "max-w-[80%] p-3 rounded-lg",
                  message.sender === 'user' ? 
                    "self-end bg-primary text-primary-foreground" : 
                    "self-start bg-background border shadow-sm"
                )}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            ))}
            {loading && (
              <div className="self-center my-2">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
          
          {/* Input Area */}
          <form 
            onSubmit={handleSend}
            className="p-3 border-t bg-background flex gap-2"
          >
            <Input
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow"
            />
            <Button 
              type="submit"
              size="icon"
              disabled={loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
