import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { AdminLayout } from "@/components/admin-layout";
import { AuthGuard } from "@/components/auth-guard";
import Home from "@/pages/home";
import About from "@/pages/about";
import Events from "@/pages/events";
import Techfest from "./pages/techfest";
import Gallery from "@/pages/gallery";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminEvents from "@/pages/admin/events";
import AdminTeam from "@/pages/admin/team";
import AdminGallery from "@/pages/admin/gallery";
import AdminRegistrations from "@/pages/admin/registrations";
import AdminAbout from "@/pages/admin/about";
import Community from "@/pages/community";
import AdminPolls from "@/pages/admin/polls";
import AdminAnnouncements from "@/pages/admin/announcements";
import AdminCourses from "@/pages/admin/courses";
import AdminUsers from "@/pages/admin/users";
import UserLogin from "@/pages/user/login";
import { useEffect, useState } from "react";
import { SplineLoader } from "./components/loader-spline";
function PageLoader() {
  return (
    <div className="fixed inset-0 bg-tech-light z-50 flex items-center justify-center">
      <SplineLoader
      />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/:rest*">
        {(params) => (
          <AuthGuard>
            <AdminLayout>
              <Switch>
                <Route path="/admin/dashboard" component={AdminDashboard} />
                <Route path="/admin/events" component={AdminEvents} />
                <Route path="/admin/team" component={AdminTeam} />
                <Route path="/admin/gallery" component={AdminGallery} />
                <Route path="/admin/registrations" component={AdminRegistrations} />
                <Route path="/admin/polls" component={AdminPolls} />
              <Route path="/admin/announcements" component={AdminAnnouncements} />
              <Route path="/admin/courses" component={AdminCourses} />
                <Route path="/admin/users" component={AdminUsers} />
                <Route path="/admin/about" component={AdminAbout} />
                <Route path="/admin/:rest*" component={() => <div className="p-6">Admin feature coming soon...</div>} />
              </Switch>
            </AdminLayout>
          </AuthGuard>
        )}
      </Route>
      
      {/* User routes */}
      <Route path="/user/login" component={UserLogin} />
      
      {/* Public routes */}
      <Route>
        {() => (
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/about" component={About} />
                <Route path="/events" component={Events} />
                <Route path="/techfest" component={Techfest} />
                <Route path="/gallery" component={Gallery} />
                <Route path="/community" component={Community} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
