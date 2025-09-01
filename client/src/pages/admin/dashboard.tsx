import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { authenticatedRequest } from "@/lib/api";
import { 
  Calendar, 
  Users, 
  Image, 
  FileText, 
  UserCheck,
  Plus,
  BarChart3,
  Vote,
  MessageSquare,
  BookOpen
} from "lucide-react";

export default function AdminDashboard() {
  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: registrations } = useQuery({
    queryKey: ["/api/admin/registrations"],
    queryFn: () => authenticatedRequest("/api/admin/registrations"),
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["/api/team"],
  });

  const { data: galleryImages } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const { data: polls } = useQuery({
    queryKey: ["/api/polls"],
    queryFn: () => authenticatedRequest("/api/polls"),
  });

  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: () => authenticatedRequest("/api/announcements"),
  });

  const { data: courseLibrary } = useQuery({
    queryKey: ["/api/course-library"],
    queryFn: () => authenticatedRequest("/api/course-library"),
  });

  const stats = [
    {
      title: "Total Events",
      value: Array.isArray(events) ? events.length : 0,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Registrations",
      value: Array.isArray(registrations) ? registrations.length : 0,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Team Members",
      value: Array.isArray(teamMembers) ? teamMembers.length : 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Gallery Images",
      value: Array.isArray(galleryImages) ? galleryImages.length : 0,
      icon: Image,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Active Polls",
      value: Array.isArray(polls) ? polls.filter((p: any) => p.isActive).length : 0,
      icon: Vote,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Announcements",
      value: Array.isArray(announcements) ? announcements.length : 0,
      icon: MessageSquare,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      title: "Course Library",
      value: Array.isArray(courseLibrary) ? courseLibrary.filter((c: any) => c.isActive).length : 0,
      icon: BookOpen,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  const quickActions = [
    {
      title: "Add Event",
      description: "Create a new event",
      href: "/admin/events/new",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Manage Registrations",
      description: "View and manage event registrations",
      href: "/admin/registrations",
      icon: UserCheck,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Create Poll",
      description: "Add new community polls",
      href: "/admin/polls",
      icon: Vote,
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      title: "Post Announcement",
      description: "Create community announcements",
      href: "/admin/announcements",
      icon: MessageSquare,
      color: "bg-pink-600 hover:bg-pink-700",
    },
    {
      title: "Add Course",
      description: "Upload new course materials",
      href: "/admin/courses",
      icon: BookOpen,
      color: "bg-teal-600 hover:bg-teal-700",
    },
    {
      title: "Bulk User Import",
      description: "Upload CSV with user data",
      href: "/admin/users/bulk",
      icon: Users,
      color: "bg-amber-600 hover:bg-amber-700",
    },
    {
      title: "Edit About Us",
      description: "Update about page content",
      href: "/admin/about",
      icon: FileText,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Manage Gallery",
      description: "Add or remove gallery images",
      href: "/admin/gallery",
      icon: Image,
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  return (
    <div className="p-6 space-y-8 bg-tech-light min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Admin Dashboard</h1>
          <p className="text-tech-grey mt-2 font-tech">Manage your technical club content</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white border-tech-grey/20" data-testid={`card-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-tech-grey font-tech">{stat.title}</p>
                  <p className="text-2xl font-bold text-tech-dark font-tech">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-tech-dark font-tech">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer bg-white border-tech-grey/20" data-testid={`card-action-${action.title.toLowerCase().replace(' ', '-')}`}>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className={`p-4 rounded-lg text-white ${action.color}`}>
                    <action.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-tech-dark font-tech">{action.title}</h3>
                    <p className="text-sm text-tech-grey font-tech">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border-tech-grey/20">
        <CardHeader>
          <CardTitle className="text-tech-dark font-tech">Recent Activity</CardTitle>
          <CardDescription className="text-tech-grey font-tech">Latest updates and registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(registrations) && registrations.slice(0, 5).map((registration: any) => (
              <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{registration.name}</p>
                  <p className="text-sm text-muted-foreground">Registered for event</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{new Date(registration.createdAt).toLocaleDateString()}</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    registration.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {registration.status}
                  </span>
                </div>
              </div>
            ))}
            {(!Array.isArray(registrations) || registrations.length === 0) && (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}