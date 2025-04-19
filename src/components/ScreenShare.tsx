import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenShare as ScreenShareIcon, Video, Search } from "lucide-react";
import { toast } from '@/components/ui/use-toast';
import { analyzeScreenshot } from '@/utils/screenAnalysis';

interface ScreenShareProps {
  onScreenCaptured: (stream: MediaStream) => void;
  isSharing: boolean;
  setIsSharing: (isSharing: boolean) => void;
}

const ScreenShare: React.FC<ScreenShareProps> = ({ 
  onScreenCaptured, 
  isSharing, 
  setIsSharing 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const startScreenShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor"
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => console.error("Error playing video:", err));
      }
      
      setStream(mediaStream);
      setIsSharing(true);
      onScreenCaptured(mediaStream);
      
      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error("Error starting screen share:", error);
      toast({
        title: "Screen sharing failed",
        description: "Please try again or check your browser permissions.",
        variant: "destructive"
      });
    }
  };
  
  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setStream(null);
    setIsSharing(false);
  };
  
  const handleAnalyze = async () => {
    if (!videoRef.current || !isSharing) {
      toast({
        title: "Cannot analyze",
        description: "Please start screen sharing first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsAnalyzing(true);
      const result = await analyzeScreenshot(videoRef.current);
      toast({
        title: "Analysis complete",
        description: "Data has been extracted and analyzed",
      });
      console.log('Analysis result:', result);
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
  
  return (
    <Card className="p-4 bg-secondary">
      <div className="flex flex-col space-y-4">
        <div className="rounded-lg overflow-hidden bg-black/10 h-[200px] w-full flex items-center justify-center">
          {isSharing ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <Video className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>No screen is being shared</p>
              <p className="text-sm">Click the button below to start sharing</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={isSharing ? stopScreenShare : startScreenShare}
            variant={isSharing ? "destructive" : "default"}
            className="flex-1"
          >
            <ScreenShareIcon className="mr-2 h-4 w-4" />
            {isSharing ? "Stop Sharing" : "Start Screen Share"}
          </Button>
          
          {isSharing && (
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              variant="secondary"
            >
              <Search className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze Data"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ScreenShare;
