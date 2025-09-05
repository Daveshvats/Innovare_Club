import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";
import { useCacheInvalidation } from "@/lib/cache-utils";
import { clearAllCaches, nuclearCacheClear } from "@/lib/cache-clear";
import { useState } from "react";

interface CacheRefreshButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showText?: boolean;
  nuclear?: boolean; // Add nuclear option
}

export function CacheRefreshButton({ 
  className = "", 
  variant = "outline", 
  size = "sm",
  showText = true,
  nuclear = false
}: CacheRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refetchAll } = useCacheInvalidation();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (nuclear) {
        // Nuclear option - clear everything
        await nuclearCacheClear();
      } else {
        // Normal refresh
        await refetchAll();
        await clearAllCaches();
      }
    } catch (error) {
      console.error("Failed to refresh cache:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant={variant}
      size={size}
      className={`${className} ${isRefreshing ? 'animate-spin' : ''}`}
    >
      {nuclear ? (
        <Trash2 className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />
      ) : (
        <RefreshCw className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />
      )}
      {showText && (
        isRefreshing 
          ? (nuclear ? 'Clearing...' : 'Refreshing...') 
          : (nuclear ? 'Clear All' : 'Refresh')
      )}
    </Button>
  );
}
