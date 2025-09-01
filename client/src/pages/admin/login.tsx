import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { adminLogin } from "@/lib/api";
import { Shield, Lock, User, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");
    
    try {
      await adminLogin(data.username, data.password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged into admin panel",
      });
      setLocation("/admin/dashboard");
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid credentials. Please try again.";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tech-light via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-tech-blue rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-tech-dark font-tech mb-2">
            Admin Portal
          </h1>
          <p className="text-tech-grey font-tech">
            Access the technical club management system
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full bg-white/80 backdrop-blur-sm border-tech-grey/20 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-tech-dark font-tech">
              Sign In
            </CardTitle>
            <CardDescription className="text-tech-grey font-tech">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your username" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech h-11"
                          {...field} 
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password" 
                            className="border-tech-grey/30 focus:border-tech-blue font-tech h-11 pr-10"
                            {...field} 
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tech-grey hover:text-tech-dark"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-tech-blue to-tech-purple hover:from-tech-purple hover:to-tech-blue text-white font-tech h-11 text-base font-semibold transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-tech-grey/20">
              <p className="text-xs text-tech-grey font-tech">
                Secure access to administrative functions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-6">
          <button
            onClick={() => setLocation("/")}
            className="text-tech-grey hover:text-tech-blue font-tech text-sm transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}