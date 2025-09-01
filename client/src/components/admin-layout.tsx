import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Image, 
  FileText, 
  UserCheck,
  Home,
  LogOut,
  BarChart3,
  MessageSquare,
  Vote,
  BookOpen,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminLogout } from "@/lib/api";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await adminLogout();
    } finally {
      setLocation('/admin/login');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Events', href: '/admin/events', icon: Calendar },
    { name: 'TechFest', href: '/admin/technofest', icon: Trophy },
    { name: 'Registrations', href: '/admin/registrations', icon: UserCheck },
    { name: 'Team', href: '/admin/team', icon: Users },
    { name: 'Polls', href: '/admin/polls', icon: Vote },
    { name: 'Announcements', href: '/admin/announcements', icon: MessageSquare },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Gallery', href: '/admin/gallery', icon: Image },
    { name: 'About Us', href: '/admin/about', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-tech-light">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-tech-dark shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-tech-grey/20">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-tech-blue" />
              <span className="font-tech font-bold text-tech-light">Innovare Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 pt-5">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors font-tech",
                      location === item.href
                        ? "bg-tech-blue text-tech-dark"
                        : "text-tech-light hover:bg-tech-grey/20 hover:text-tech-blue"
                    )}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 shrink-0",
                        location === item.href
                          ? "text-tech-dark"
                          : "text-tech-grey group-hover:text-tech-blue"
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="px-4 pb-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-tech-light hover:bg-red-900/20 hover:text-red-400 font-tech"
              data-testid="button-logout"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}