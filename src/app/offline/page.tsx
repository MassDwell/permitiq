"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ml-last-sync");
    if (stored) {
      setLastSync(new Date(stored).toLocaleString());
    }
  }, []);

  const handleRetry = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-slate-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">You are offline</h1>

        <p className="text-slate-400 mb-6">
          {lastSync
            ? `Your last sync was ${lastSync}. Reconnect to see latest permit status.`
            : "Reconnect to the internet to see your latest permit status."}
        </p>

        <Button
          onClick={handleRetry}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>

        <p className="text-sm text-slate-500 mt-8">
          MeritLayer will automatically sync when you are back online.
        </p>
      </div>
    </div>
  );
}
