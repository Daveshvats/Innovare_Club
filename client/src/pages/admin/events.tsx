import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calendar, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
  featured: z.boolean().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function AdminEvents() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      tags: "",
      featured: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventData = {
        ...data,
        date: new Date(data.date).toISOString(),
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        featured: data.featured ? 1 : 0,
      };
      return await apiRequest("/api/events", "POST", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsOpen(false);
      setEditingEvent(null);
      form.reset();
      toast({
        title: "Success",
        description: "Event created successfully",
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

  const updateMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventData = {
        ...data,
        date: new Date(data.date).toISOString(),
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        featured: data.featured ? 1 : 0,
      };
      return await apiRequest(`/api/events/${editingEvent.id}`, "PATCH", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsOpen(false);
      setEditingEvent(null);
      form.reset();
      toast({
        title: "Success",
        description: "Event updated successfully",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/events/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
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

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      location: event.location,
      imageUrl: event.imageUrl || "",
      tags: event.tags ? event.tags.join(", ") : "",
      featured: event.featured === 1,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: EventFormData) => {
    if (editingEvent) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setEditingEvent(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-tech-light min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-tech-grey/20 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Events Management</h1>
          <p className="text-tech-grey mt-2 font-tech">Create and manage club events</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-tech-blue hover:bg-tech-purple text-white font-tech" data-testid="button-add-event">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-tech-dark font-tech">
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
              <DialogDescription className="text-tech-grey font-tech">
                {editingEvent ? "Update event details" : "Create a new event for your club"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Event title" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-event-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Event description" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-event-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-event-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Event location" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-event-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-event-image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Tags (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="workshop, tech, ai (comma separated)" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-event-tags"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDialogClose}
                    className="font-tech"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
                    data-testid="button-save-event"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? "Saving..." 
                      : editingEvent 
                        ? "Update" 
                        : "Create"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {Array.isArray(events) && events.length > 0 ? (
          events.map((event: any) => (
            <Card key={event.id} className="bg-white border-tech-grey/20" data-testid={`card-event-${event.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-tech-dark font-tech">{event.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-tech-grey mt-2 font-tech">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      {event.featured === 1 && (
                        <Badge variant="secondary" className="bg-tech-blue/10 text-tech-blue">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      className="font-tech"
                      data-testid={`button-edit-${event.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-700 font-tech"
                      data-testid={`button-delete-${event.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-tech-grey mb-4 font-tech">{event.description}</p>
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="font-tech">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white border-tech-grey/20">
            <CardContent className="p-8 text-center">
              <p className="text-tech-grey font-tech">No events found. Create your first event!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}