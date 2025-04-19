
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenShare as ScreenShareIcon, Video } from "lucide-react";
import { toast } from '@/components/ui/use-toast';

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
  
  const startScreenShare = async () => {
    try {
      // Request screen sharing
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsSharing(true);
      onScreenCaptured(mediaStream);
      
      // Handle when user stops sharing
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
  
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
  
  return (
    <Card className="p-4 bg-secondary">
      <div className="flex flex-col space-y-4">
        <div className="rounded-lg overflow-hidden bg-black/50 h-[300px] w-full flex items-center justify-center">
          {isSharing ? (
            <video 
              ref={videoRef} 
              autoPlay 
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
        
        <Button 
          onClick={isSharing ? stopScreenShare : startScreenShare}
          variant={isSharing ? "destructive" : "default"}
          className="w-full"
        >
          <ScreenShareIcon className="mr-2 h-4 w-4" />
          {isSharing ? "Stop Sharing" : "Start Screen Share"}
        </Button>
      </div>
    </Card>
  );
};

export default ScreenShare;
