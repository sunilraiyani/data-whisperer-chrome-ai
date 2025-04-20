
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Server, ServerCrash } from "lucide-react";

const BackendStatusIndicator: React.FC = () => {
  const [isBackendRunning, setIsBackendRunning] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/docs');
        setIsBackendRunning(response.ok);
      } catch (error) {
        setIsBackendRunning(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isBackendRunning ? "success" : "destructive"}
              className="h-6 cursor-help"
            >
              {isChecking ? (
                "Checking backend..."
              ) : (
                <>
                  {isBackendRunning ? (
                    <>
                      <Server className="h-3.5 w-3.5 mr-1" />
                      Backend Connected
                    </>
                  ) : (
                    <>
                      <ServerCrash className="h-3.5 w-3.5 mr-1" />
                      Backend Offline
                    </>
                  )}
                </>
              )}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isBackendRunning 
            ? "The Python backend server is running and connected."
            : "The Python backend server is not running. Run 'python app.py' in the backend directory."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BackendStatusIndicator;
