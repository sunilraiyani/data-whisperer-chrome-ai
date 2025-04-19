
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUp } from "lucide-react";
import ChatMessage, { Message } from './ChatMessage';
import VoiceInput from './VoiceInput';
import { toast } from '@/components/ui/use-toast';

interface ChatInterfaceProps {
  isScreenSharing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isScreenSharing }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Add welcome message when component mounts
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hello! Share your screen with a spreadsheet and I can help you analyze the data. What would you like to know?',
          timestamp: new Date()
        }
      ]);
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Create new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInput('');
    
    // Show error if screen is not being shared
    if (!isScreenSharing) {
      toast({
        title: 'Screen not shared',
        description: 'Please share your screen with a spreadsheet first.',
        variant: 'destructive'
      });
      
      // Add system message about sharing screen
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString() + '-system',
          role: 'assistant',
          content: 'Please share your screen with a spreadsheet first so I can see the data you want to analyze.',
          timestamp: new Date()
        }
      ]);
      
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    // Simulate AI response (in a real app, you would call an API)
    setTimeout(() => {
      // Create mock AI response based on the query
      const mockResponses: Record<string, string> = {
        'average': 'Looking at the TSLA data on your screen, the average price over the last 5 days appears to be $267.34.',
        'highest': 'Based on the data visible in your spreadsheet, AAPL has shown the highest growth of 4.2% in the last week.',
        'total': 'The total value across all stocks in your spreadsheet is $14,287,651.',
        'trend': 'I can see a downward trend for most tech stocks in your spreadsheet over the last month, with an average decline of 2.3%.',
        'compare': 'Comparing the stocks in your spreadsheet, MSFT has outperformed GOOG by approximately 3.6% this quarter.'
      };
      
      // Find a relevant response or use default
      let responseContent = 'Based on the spreadsheet data I can see, ';
      const lowercaseInput = userMessage.content.toLowerCase();
      
      for (const [keyword, response] of Object.entries(mockResponses)) {
        if (lowercaseInput.includes(keyword)) {
          responseContent = response;
          break;
        }
      }
      
      if (responseContent === 'Based on the spreadsheet data I can see, ') {
        responseContent += 'I can analyze that the top performing stock is AAPL with a 4.2% increase, while TSLA has been the most volatile with a standard deviation of 3.7% in daily returns.';
      }
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        }
      ]);
      
      // End loading state
      setIsLoading(false);
    }, 2000);
  };
  
  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
  };
  
  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="px-4 py-2">
        <CardTitle className="text-xl">Data Whisperer Chat</CardTitle>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        <div className="flex flex-col">
          {messages.map(message => (
            <ChatMessage 
              key={message.id} 
              message={message} 
            />
          ))}
          
          {isLoading && (
            <ChatMessage 
              message={{
                id: 'loading',
                role: 'assistant',
                content: 'Analyzing your data',
                timestamp: new Date()
              }}
              isLoading={true}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-4">
        <div className="flex w-full gap-2">
          <VoiceInput onTranscript={handleVoiceInput} />
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the data in your spreadsheet..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={input.trim() === ''}
            size="icon"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
