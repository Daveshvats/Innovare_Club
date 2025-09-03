import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calendar, MapPin, Star } from "lucide-react";
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
  registrationType: z.enum(["dialog", "redirect"]).default("dialog"),
  registrationUrl: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function AdminEvents() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showFeaturedWarning, setShowFeaturedWarning] = useState(false);
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  // Check if there's already a featured event
  const existingFeaturedEvent = events?.find((event: any) => event.featured === 1);

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
      registrationType: "dialog",
      registrationUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      console.log("Frontend create data:", data);
      console.log("Frontend date value:", data.date);
      
      const eventData = {
        ...data,
        date: data.date ? data.date : new Date().toISOString().split('T')[0],
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        featured: data.featured ? 1 : 0,
      };
      
      console.log("Frontend processed data:", eventData);
      return await apiRequest("/api/admin/events", "POST", eventData);
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
      console.log("Frontend update data:", data);
      console.log("Frontend update date value:", data.date);
      
      const eventData = {
        ...data,
        date: data.date ? data.date : new Date().toISOString().split('T')[0],
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        featured: data.featured ? 1 : 0,
      };
      
      console.log("Frontend processed update data:", eventData);
      return await apiRequest(`/api/admin/events/${editingEvent.id}`, "PATCH", eventData);
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
      return await apiRequest(`/api/admin/events/${id}`, "DELETE");
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
      registrationType: event.registrationType || "dialog",
      registrationUrl: event.registrationUrl || "",
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
    setShowFeaturedWarning(false);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 bg-tech-light min-h-screen">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-tech-grey/20 rounded w-1/2 sm:w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 sm:h-32 bg-tech-grey/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-tech-light min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-tech text-tech-dark">Events Management</h1>
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

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            // Show warning if there's already a featured event and this is a new event
                            if (checked && existingFeaturedEvent && !editingEvent) {
                              setShowFeaturedWarning(true);
                            }
                          }}
                          data-testid="checkbox-featured"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-tech-dark font-tech flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Featured Event
                        </FormLabel>
                        <p className="text-sm text-tech-grey font-tech">
                          Mark this event as featured to highlight it on the homepage
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Featured Event Warning */}
                {showFeaturedWarning && existingFeaturedEvent && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Star className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 font-tech">
                          Featured Event Warning
                        </h4>
                        <p className="text-sm text-yellow-700 font-tech mt-1">
                          There is already a featured event: <strong>"{existingFeaturedEvent.title}"</strong>.
                          Setting this event as featured will remove the featured status from the existing event.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setShowFeaturedWarning(false)}
                            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setShowFeaturedWarning(false)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="registrationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Registration Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-tech-grey/30 focus:border-tech-blue font-tech">
                            <SelectValue placeholder="Select registration type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dialog">Registration Dialog</SelectItem>
                          <SelectItem value="redirect">Redirect to Page</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("registrationType") === "redirect" && (
                  <FormField
                    control={form.control}
                    name="registrationUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-tech-dark font-tech">Registration URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="/techfest or https://example.com/register" 
                            className="border-tech-grey/30 focus:border-tech-blue font-tech"
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-sm text-tech-grey font-tech">
                          Enter the URL where users should be redirected for registration
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="h-3 w-3 mr-1" />
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