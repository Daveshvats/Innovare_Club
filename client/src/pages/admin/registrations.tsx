import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { authenticatedRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Mail, Phone, Calendar, User, Download, Users, ChevronRight, ArrowLeft, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function AdminRegistrations() {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<{id: string, name: string, type: string} | null>(null);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["/api/admin/registrations"],
    queryFn: () => authenticatedRequest("/api/admin/registrations"),
  });

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: techfestEvents } = useQuery({
    queryKey: ["/api/technofest"],
  });

  // Fetch all team members for techfest registrations
  const { data: allTeamMembers } = useQuery({
    queryKey: ["/api/admin/team-members"],
    queryFn: () => authenticatedRequest("/api/admin/team-members"),
  });

  // Fetch registrations for selected event
  const { data: eventRegistrations, isLoading: isLoadingEventRegistrations } = useQuery({
    queryKey: ["/api/admin/events", selectedEvent?.id, "registrations"],
    queryFn: async () => {
      if (!selectedEvent) return [];
      const response = await authenticatedRequest(`/api/admin/events/${selectedEvent.id}/registrations?eventType=${selectedEvent.type}`);
      return response;
    },
    enabled: !!selectedEvent,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await authenticatedRequest(`/api/admin/registrations/${id}/status`, "PATCH", { status });
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

  // Helper function to get team members for a specific registration
  const getTeamMembers = (registrationId: string) => {
    if (!Array.isArray(allTeamMembers)) {
      return [];
    }
    const members = allTeamMembers.filter(member => member.registrationId === registrationId);
    return members;
  };

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

  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await authenticatedRequest(`/api/admin/registrations/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
      if (selectedEvent) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/events", selectedEvent.id, "registrations"] });
      }
      toast({
        title: "Success",
        description: "Registration deleted successfully",
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

  const handleDeleteRegistration = (id: string) => {
    if (window.confirm("Are you sure you want to delete this registration? This action cannot be undone.")) {
      deleteRegistrationMutation.mutate(id);
    }
  };

  const downloadCSVMutation = useMutation({
    mutationFn: async (eventId?: string, eventType?: string) => {
      const url = eventId 
        ? `/api/admin/events/${eventId}/registrations/csv?eventType=${eventType}`
        : '/api/admin/registrations/csv';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Check if blob is empty
      if (blob.size === 0) {
        throw new Error('CSV file is empty');
      }
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = eventId 
        ? `${eventType === 'TechFest' ? 'techfest' : 'event'}-${eventId}-registrations-${new Date().toISOString().split('T')[0]}.csv`
        : `all-registrations-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CSV file downloaded successfully",
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

  const handleDownloadCSV = (eventId?: string, eventType?: string) => {
    downloadCSVMutation.mutate(eventId, eventType);
  };

  // Helper function to get events with registrations
  const getEventsWithRegistrations = () => {
    if (!Array.isArray(registrations)) return [];
    
    const eventMap = new Map();
    
    // Process regular events
    if (Array.isArray(events)) {
      events.forEach(event => {
        const eventRegistrations = registrations.filter(reg => 
          reg.eventId === event.id && reg.eventType === 'Event'
        );
        if (eventRegistrations.length > 0) {
          eventMap.set(event.id, {
            id: event.id,
            name: event.title,
            type: 'Event',
            registrationCount: eventRegistrations.length,
            registrations: eventRegistrations
          });
        }
      });
    }
    
    // Process TechFest events
    if (Array.isArray(techfestEvents)) {
      techfestEvents.forEach(event => {
        const eventRegistrations = registrations.filter(reg => 
          reg.eventId === event.id && reg.eventType === 'TechFest'
        );
        if (eventRegistrations.length > 0) {
          eventMap.set(event.id, {
            id: event.id,
            name: event.name,
            type: 'TechFest',
            registrationCount: eventRegistrations.length,
            registrations: eventRegistrations
          });
        }
      });
    }
    
    return Array.from(eventMap.values());
  };

  const eventsWithRegistrations = getEventsWithRegistrations();
  
  // Debug logging
  console.log('Registrations:', registrations);
  console.log('All Team Members:', allTeamMembers);
  console.log('Events with registrations:', eventsWithRegistrations);

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

  // Show event registrations view
  if (selectedEvent) {
    return (
      <div className="p-6 space-y-6 bg-tech-light min-h-screen">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setSelectedEvent(null)}
            className="font-tech"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-tech text-tech-dark">{selectedEvent.name}</h1>
            <p className="text-tech-grey mt-2 font-tech">
              {selectedEvent.type} • {eventRegistrations?.length || 0} registrations
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm font-tech text-tech-grey">
            Showing registrations for: {selectedEvent.name}
          </div>
          <Button 
            onClick={() => handleDownloadCSV(selectedEvent.id, selectedEvent.type)}
            disabled={downloadCSVMutation.isPending}
            className="bg-tech-blue hover:bg-tech-blue/90 text-white font-tech"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloadCSVMutation.isPending ? 'Downloading...' : 'Download CSV'}
          </Button>
        </div>

        {isLoadingEventRegistrations ? (
          <div className="animate-pulse">
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-tech-grey/20 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(eventRegistrations) && eventRegistrations.length > 0 ? (
              eventRegistrations.map((registration: any) => (
                <Card key={registration.id} className="bg-white border-tech-grey/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-tech-dark font-tech flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          {registration.eventType === 'TechFest' ? registration.teamName : registration.name}
                        </CardTitle>
                        {registration.eventType === 'TechFest' && registration.teamLeaderName && (
                          <p className="text-sm text-tech-grey mt-1">
                            Team Leader: <span className="font-semibold">{registration.teamLeaderName}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(registration.status || 'pending')}>
                          {registration.status || 'pending'}
                        </Badge>
                        <Select
                          value={registration.status || 'pending'}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRegistration(registration.id)}
                          disabled={deleteRegistrationMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-tech-grey font-tech">
                          <Mail className="h-4 w-4 mr-2" />
                          {registration.eventType === 'TechFest' ? registration.contactEmail : registration.email}
                        </div>
                        {registration.phone && (
                          <div className="flex items-center text-sm text-tech-grey font-tech">
                            <Phone className="h-4 w-4 mr-2" />
                            {registration.phone}
                          </div>
                        )}
                        {registration.eventType === 'TechFest' && registration.teamLeaderEmail && (
                          <div className="flex items-center text-sm text-tech-grey font-tech">
                            <Mail className="h-4 w-4 mr-2" />
                            Leader: {registration.teamLeaderEmail}
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
                          Status: {registration.status || 'pending'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Show team information for ALL registrations - debug version */}
                    <div className="mt-4 pt-4 border-t border-tech-grey/20">
                      <h4 className="text-sm font-semibold text-tech-dark mb-2">Registration Details:</h4>
                      <div className="space-y-2">
                        <div className="text-sm text-tech-grey">
                          <span className="font-medium">Event Type:</span> {registration.eventType || 'Unknown'}
                        </div>
                        <div className="text-sm text-tech-grey">
                          <span className="font-medium">Registration ID:</span> {registration.id}
                        </div>
                        
                        {/* Show team information for TechFest registrations */}
                        {registration.eventType === 'TechFest' && (
                          <>
                            <div className="text-sm text-tech-grey">
                              <span className="font-medium">Team Name:</span> {registration.teamName || 'N/A'}
                            </div>
                            <div className="text-sm text-tech-grey">
                              <span className="font-medium">Team Leader:</span> {registration.teamLeaderName || 'N/A'}
                            </div>
                            <div className="text-sm text-tech-grey">
                              <span className="font-medium">Leader Email:</span> {registration.teamLeaderEmail || 'N/A'}
                            </div>
                            <div className="text-sm text-tech-grey">
                              <span className="font-medium">Contact Email:</span> {registration.contactEmail || 'N/A'}
                            </div>
                            
                            <div className="mt-3">
                              <h5 className="text-sm font-semibold text-tech-dark mb-2">Team Members:</h5>
                              <div className="space-y-1">
                                <div className="text-sm text-tech-grey">
                                  <span className="font-medium">1.</span> {registration.teamLeaderName || 'N/A'} (Team Leader)
                                </div>
                                {(() => {
                                  const teamMembers = getTeamMembers(registration.id);
                                  if (teamMembers.length === 0) {
                                    return (
                                      <div className="text-sm text-tech-grey/70 italic">
                                        No additional team members found
                                      </div>
                                    );
                                  }
                                  return teamMembers.map((member, index) => (
                                    <div key={member.id} className="text-sm text-tech-grey">
                                      <span className="font-medium">{index + 2}.</span> {member.name || 'N/A'}
                                      {member.email && <span className="text-tech-grey/70 ml-2">({member.email})</span>}
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Show individual registration info for regular events */}
                        {registration.eventType === 'Event' && (
                          <>
                            <div className="text-sm text-tech-grey">
                              <span className="font-medium">Name:</span> {registration.name || 'N/A'}
                            </div>
                            <div className="text-sm text-tech-grey">
                              <span className="font-medium">Email:</span> {registration.email || 'N/A'}
                            </div>
                            {registration.phone && (
                              <div className="text-sm text-tech-grey">
                                <span className="font-medium">Phone:</span> {registration.phone}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white border-tech-grey/20">
                <CardContent className="p-8 text-center">
                  <UserCheck className="h-12 w-12 text-tech-grey mx-auto mb-4" />
                  <p className="text-tech-grey font-tech">No registrations found for this event.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show events list view
  return (
    <div className="p-6 space-y-6 bg-tech-light min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Event Registrations</h1>
          <p className="text-tech-grey mt-2 font-tech">Select an event to view its registrations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm font-tech text-tech-grey">
            {eventsWithRegistrations.length} events with registrations
          </div>
          <Button 
            onClick={() => handleDownloadCSV()}
            disabled={downloadCSVMutation.isPending}
            className="bg-tech-blue hover:bg-tech-blue/90 text-white font-tech"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloadCSVMutation.isPending ? 'Downloading...' : 'Download All CSV'}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsWithRegistrations.length > 0 ? (
          eventsWithRegistrations.map((event) => (
            <Card 
              key={event.id} 
              className="bg-white border-tech-grey/20 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedEvent({ id: event.id, name: event.name, type: event.type })}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-tech-dark font-tech flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {event.name}
                    </CardTitle>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <ChevronRight className="h-5 w-5 text-tech-grey" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tech-grey font-tech">Registrations:</span>
                    <span className="text-lg font-bold text-tech-blue font-tech">{event.registrationCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tech-grey font-tech">Approved:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {event.registrations.filter((r: any) => (r.status || 'pending') === 'approved').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tech-grey font-tech">Pending:</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {event.registrations.filter((r: any) => (r.status || 'pending') === 'pending').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white border-tech-grey/20 col-span-full">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-tech-grey mx-auto mb-4" />
              <p className="text-tech-grey font-tech">No events with registrations found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}