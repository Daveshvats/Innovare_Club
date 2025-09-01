import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Mail, Phone, Calendar, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminRegistrations() {
  const { toast } = useToast();

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["/api/admin/registrations"],
  });

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: techfestEvents } = useQuery({
    queryKey: ["/api/technofest"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest(`/api/admin/registrations/${id}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
      toast({
        title: "Success",
        description: "Registration status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getEventTitle = (eventId: string, eventType?: string) => {
    if (eventType === 'TechFest') {
      if (!Array.isArray(techfestEvents)) return "Unknown TechFest Event";
      const event = techfestEvents.find((e: any) => e.id === eventId);
      return event ? `${event.name} (TechFest)` : "Unknown TechFest Event";
    } else {
      if (!Array.isArray(events)) return "Unknown Event";
      const event = events.find((e: any) => e.id === eventId);
      return event ? event.title : "Unknown Event";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-tech-light min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-tech-grey/20 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-tech-grey/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-tech-light min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Registrations</h1>
          <p className="text-tech-grey mt-2 font-tech">Manage event registrations and approvals</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm font-tech text-tech-grey">
            Total: {Array.isArray(registrations) ? registrations.length : 0} registrations
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Array.isArray(registrations) && registrations.length > 0 ? (
          registrations.map((registration: any) => (
            <Card key={registration.id} className="bg-white border-tech-grey/20" data-testid={`card-registration-${registration.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-tech-dark font-tech flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      {registration.name}
                    </CardTitle>
                    <p className="text-tech-blue font-tech mt-1">{getEventTitle(registration.eventId, registration.eventType)}</p>
                    {registration.eventType && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {registration.eventType}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(registration.status)}>
                      {registration.status}
                    </Badge>
                    <Select
                      value={registration.status}
                      onValueChange={(status) => handleStatusChange(registration.id, status)}
                    >
                      <SelectTrigger className="w-32 border-tech-grey/30 font-tech">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-tech-grey font-tech">
                      <Mail className="h-4 w-4 mr-2" />
                      {registration.email}
                    </div>
                    {registration.phone && (
                      <div className="flex items-center text-sm text-tech-grey font-tech">
                        <Phone className="h-4 w-4 mr-2" />
                        {registration.phone}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-tech-grey font-tech">
                      <Calendar className="h-4 w-4 mr-2" />
                      Registered: {new Date(registration.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-tech-grey font-tech">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Status: {registration.status}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white border-tech-grey/20">
            <CardContent className="p-8 text-center">
              <UserCheck className="h-12 w-12 text-tech-grey mx-auto mb-4" />
              <p className="text-tech-grey font-tech">No registrations found.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics Summary */}
      {Array.isArray(registrations) && registrations.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white border-tech-grey/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 font-tech">
                  {registrations.filter((r: any) => r.status === "approved").length}
                </div>
                <div className="text-sm text-tech-grey font-tech">Approved</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-tech-grey/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 font-tech">
                  {registrations.filter((r: any) => r.status === "pending").length}
                </div>
                <div className="text-sm text-tech-grey font-tech">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-tech-grey/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 font-tech">
                  {registrations.filter((r: any) => r.status === "rejected").length}
                </div>
                <div className="text-sm text-tech-grey font-tech">Rejected</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}