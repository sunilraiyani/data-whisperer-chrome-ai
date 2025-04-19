
import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <Card className={cn(
        "max-w-[80%] p-3",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-secondary-foreground"
      )}>
        <div className="flex flex-col">
          <div className="text-sm font-medium">
            {isUser ? 'You' : 'Data Whisperer'}
          </div>
          <div className={isLoading ? "typing-indicator" : ""}>
            {message.content}
          </div>
          <div className="text-xs opacity-70 text-right mt-1">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatMessage;
