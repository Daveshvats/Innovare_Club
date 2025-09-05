import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useCacheInvalidation } from "@/lib/cache-utils";
import { useState } from "react";

interface CacheRefreshButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showText?: boolean;
}

export function CacheRefreshButton({ 
  className = "", 
  variant = "outline", 
  size = "sm",
  showText = true 
}: CacheRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refetchAll } = useCacheInvalidation();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchAll();
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
      <RefreshCw className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />
      {showText && (isRefreshing ? 'Refreshing...' : 'Refresh')}
    </Button>
  );
}
