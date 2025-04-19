
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/use-toast';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }
    
    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configure recognition
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    // Add event listeners
    recognitionInstance.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      onTranscript(transcript);
    };
    
    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast({
        title: 'Voice recognition error',
        description: `Error: ${event.error}. Please try again.`,
        variant: 'destructive'
      });
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    setRecognition(recognitionInstance);
    
    // Cleanup
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [onTranscript]);
  
  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: 'Voice recognition not supported',
        description: 'Your browser does not support voice recognition.',
        variant: 'destructive'
      });
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleListening}
      className={isListening ? 'bg-red-500/20' : ''}
    >
      <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-red-500 wave' : 'bg-neutral-400'}`} />
    </Button>
  );
};

// Declare the SpeechRecognition interfaces for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default VoiceInput;
