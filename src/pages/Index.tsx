
import React, { useState } from 'react';
import ScreenShare from '@/components/ScreenShare';
import ChatInterface from '@/components/ChatInterface';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [capturedStream, setCapturedStream] = useState<MediaStream | null>(null);
  
  const handleScreenCaptured = (stream: MediaStream) => {
    console.log("Screen captured, setting stream");
    setCapturedStream(stream);
  };
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Data Whisperer</h1>
          <p className="text-muted-foreground">
            Share your spreadsheet and ask questions about your data
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Share Your Screen</h2>
                <p className="text-muted-foreground mb-6">
                  Start by sharing your screen, window, or tab that contains your spreadsheet data.
                </p>
                
                <ScreenShare 
                  onScreenCaptured={handleScreenCaptured}
                  isSharing={isScreenSharing}
                  setIsSharing={setIsScreenSharing}
                />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2 text-primary">Instructions</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Share a screen with a visible spreadsheet</li>
                    <li>Make sure the data you want to analyze is visible</li>
                    <li>Ask questions in the chat or use voice input</li>
                    <li>For best results, use clear column headers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <ChatInterface isScreenSharing={isScreenSharing} />
          </div>
        </div>
        
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Data Whisperer - AI powered spreadsheet analysis</p>
          <p>Works with Google Sheets, Microsoft Excel, and other spreadsheet applications</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
