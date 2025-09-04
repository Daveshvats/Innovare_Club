import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { AdminLayout } from "@/components/admin-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useEffect, useState, lazy, Suspense } from "react";
import { SplineLoader } from "./components/loader-spline";
import { preloadSplineRuntime } from "@/lib/spline-loader";

// Lazy load heavy components
const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Events = lazy(() => import("@/pages/events"));
const Techfest = lazy(() => import("./pages/techfest"));
const TechFestEvents = lazy(() => import("./pages/techfestevents"));
const Gallery = lazy(() => import("@/pages/gallery"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminEvents = lazy(() => import("@/pages/admin/events"));
const AdminTeam = lazy(() => import("@/pages/admin/team"));
const AdminEventGallery = lazy(() => import("@/pages/admin/event-gallery"));
const AdminRegistrations = lazy(() => import("@/pages/admin/registrations"));
const AdminAbout = lazy(() => import("@/pages/admin/about"));
const Community = lazy(() => import("@/pages/community"));
const AdminPolls = lazy(() => import("@/pages/admin/polls"));
const AdminAnnouncements = lazy(() => import("@/pages/admin/announcements"));
const AdminCourses = lazy(() => import("@/pages/admin/courses"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminTechnofest = lazy(() => import("@/pages/admin/technofest"));
const UserLogin = lazy(() => import("@/pages/user/login"));
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
                <Route path="/admin/technofest" component={AdminTechnofest} />
                <Route path="/admin/team" component={AdminTeam} />
                <Route path="/admin/event-gallery" component={AdminEventGallery} />
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
                <Route path="/techfestevents" component={TechFestEvents} />
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
    // Preload Spline runtime for better performance
    preloadSplineRuntime();
    
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
        <Suspense fallback={<PageLoader />}>
          <Router />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
