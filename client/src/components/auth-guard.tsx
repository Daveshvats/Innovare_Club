import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getAuthToken } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      if (!token) {
        setLocation("/admin/login");
        return;
      }
      
      // Here you could also validate the token with the server
      // For now, we'll just check if it exists
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tech-light">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-tech-blue mx-auto mb-4" />
          <p className="text-tech-grey font-tech">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
