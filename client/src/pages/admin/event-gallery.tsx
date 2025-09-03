import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, Star, Calendar, MapPin, Eye, EyeOff } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const galleryImageSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  description: z.string().optional(),
  isMainImage: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
  isGalleryOnly: z.boolean().default(false),
  galleryImageUrls: z.string().optional(), // Multiple image URLs separated by newlines
});

type GalleryImageFormData = z.infer<typeof galleryImageSchema>;
type EventFormData = z.infer<typeof eventSchema>;

interface GalleryImage {
  id: string;
  eventId: string;
  title: string;
  imageUrl: string;
  description?: string;
  isMainImage: boolean;
  displayOrder: number;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  isGalleryOnly?: boolean;
  galleryImages?: GalleryImage[];
  mainGalleryImage?: GalleryImage;
}

export default function AdminEventGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [bulkImageUrls, setBulkImageUrls] = useState<string>("");
  const { toast } = useToast();

  const { data: events, isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ["/api/admin/events"],
    queryFn: () => apiRequest("/api/admin/events", "GET"),
    retry: (failureCount, error: any) => {
      if (error?.status === 401) {
        console.error("Authentication failed for admin events:", error);
        return false; // Don't retry on auth errors
      }
      return failureCount < 3;
    },
  });

  const { data: galleryImages, isLoading: imagesLoading, error: imagesError } = useQuery({
    queryKey: ["/api/gallery"],
    queryFn: () => apiRequest("/api/gallery", "GET"),
    retry: (failureCount, error: any) => {
      if (error?.status === 401) {
        console.error("Authentication failed for gallery:", error);
        return false; // Don't retry on auth errors
      }
      return failureCount < 3;
    },
  });

  const form = useForm<GalleryImageFormData>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: {
      eventId: "",
      title: "",
      imageUrl: "",
      description: "",
      isMainImage: false,
      displayOrder: 0,
    },
  });

  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      tags: "",
      isGalleryOnly: false,
      galleryImageUrls: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GalleryImageFormData) => {
      console.log("Creating gallery image with data:", data);
      return await apiRequest("/api/admin/gallery", "POST", data);
    },
    onSuccess: (response) => {
      console.log("Gallery image created successfully:", response);
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      setIsOpen(false);
      setEditingImage(null);
      form.reset();
      toast({
        title: "Success",
        description: "Gallery image added successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Gallery image creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create gallery image",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: GalleryImageFormData) => {
      return await apiRequest(`/api/admin/gallery/${editingImage?.id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      setIsOpen(false);
      setEditingImage(null);
      form.reset();
      toast({
        title: "Success",
        description: "Gallery image updated successfully",
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
      return await apiRequest(`/api/admin/gallery/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({
        title: "Success",
        description: "Gallery image deleted successfully",
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

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      console.log("Creating event with data:", data);
      
      // First create the event
      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        imageUrl: data.imageUrl,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        isGalleryOnly: true, // Always create as gallery-only event
        isActive: true,
        featured: false,
        currentParticipants: 0,
        registrationType: "dialog",
      };
      
      console.log("Sending event data:", eventData);
      const eventResponse = await apiRequest("/api/admin/events", "POST", eventData);
      
      // If there are gallery image URLs, create gallery images
      if (data.galleryImageUrls && data.galleryImageUrls.trim()) {
        const imageUrls = data.galleryImageUrls
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0);
        
        if (imageUrls.length > 0) {
          console.log("Creating gallery images:", imageUrls);
          const galleryPromises = imageUrls.map((url, index) => 
            apiRequest("/api/admin/gallery", "POST", {
              eventId: eventResponse.id,
              title: `${data.title} - Image ${index + 1}`,
              imageUrl: url,
              description: "",
              isMainImage: index === 0, // First image is main
              displayOrder: index,
            })
          );
          
          await Promise.all(galleryPromises);
          console.log("Gallery images created successfully");
        }
      }
      
      return eventResponse;
    },
    onSuccess: (response) => {
      console.log("Event and gallery images created successfully:", response);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsEventDialogOpen(false);
      setEditingEvent(null);
      eventForm.reset();
      toast({
        title: "Success",
        description: "Gallery event and images created successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Event creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    form.reset({
      eventId: image.eventId,
      title: image.title,
      imageUrl: image.imageUrl,
      description: image.description || "",
      isMainImage: image.isMainImage,
      displayOrder: image.displayOrder,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this gallery image?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: GalleryImageFormData) => {
    if (editingImage) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setEditingImage(null);
    form.reset();
  };

  const handleEventDialogClose = () => {
    setIsEventDialogOpen(false);
    setEditingEvent(null);
    eventForm.reset();
  };

  const handleAddToEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    form.reset({
      eventId: eventId,
      title: "",
      imageUrl: "",
      description: "",
      isMainImage: false,
      displayOrder: 0,
    });
    setIsOpen(true);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    eventForm.reset();
    setIsEventDialogOpen(true);
  };

  const onEventSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const bulkUploadMutation = useMutation({
    mutationFn: async (data: { eventId: string; imageUrls: string[] }) => {
      const promises = data.imageUrls.map((url, index) => 
        apiRequest("/api/admin/gallery", "POST", {
          eventId: data.eventId,
          title: `Image ${index + 1}`,
          imageUrl: url.trim(),
          description: "",
          isMainImage: index === 0, // First image is main
          displayOrder: index,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: (responses) => {
      console.log("Bulk upload successful:", responses);
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      setIsBulkUploadOpen(false);
      setBulkImageUrls("");
      toast({
        title: "Success",
        description: `${responses.length} images added successfully`,
      });
    },
    onError: (error: Error) => {
      console.error("Bulk upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    },
  });

  const handleBulkUpload = (eventId: string) => {
    setSelectedEventId(eventId);
    setBulkImageUrls("");
    setIsBulkUploadOpen(true);
  };

  const handleBulkSubmit = () => {
    if (!bulkImageUrls.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one image URL",
        variant: "destructive",
      });
      return;
    }

    const urls = bulkImageUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid image URLs",
        variant: "destructive",
      });
      return;
    }

    bulkUploadMutation.mutate({
      eventId: selectedEventId,
      imageUrls: urls,
    });
  };

  // Group images by event
  const imagesByEvent = galleryImages?.reduce((acc: Record<string, GalleryImage[]>, image: GalleryImage) => {
    if (!acc[image.eventId]) {
      acc[image.eventId] = [];
    }
    acc[image.eventId].push(image);
    return acc;
  }, {}) || {};

  if (eventsLoading || imagesLoading) {
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

  // Handle authentication errors
  if (eventsError?.status === 401 || imagesError?.status === 401) {
    return (
      <div className="p-4 sm:p-6 bg-tech-light min-h-screen">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-tech font-bold text-tech-dark mb-2">Authentication Required</h2>
          <p className="text-tech-grey font-tech mb-4">
            You need to be logged in as an admin to access this page.
          </p>
          <Button
            onClick={() => window.location.href = '/admin/login'}
            className="tech-gradient text-white font-tech"
          >
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-tech-light min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-tech font-bold text-tech-dark">
            Event Gallery Management
          </h1>
          <p className="text-tech-grey font-tech mt-1">
            Manage gallery images for each event and create gallery-only events
          </p>
        </div>
        <Button
          onClick={handleCreateEvent}
          className="tech-gradient text-white font-tech"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Gallery Event
        </Button>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-sm mb-2">Debug Info:</h3>
          <p className="text-xs">Events loaded: {events?.length || 0}</p>
          <p className="text-xs">Events loading: {eventsLoading ? 'Yes' : 'No'}</p>
          <p className="text-xs">Images loading: {imagesLoading ? 'Yes' : 'No'}</p>
          <p className="text-xs">Gallery images: {galleryImages?.length || 0}</p>
          <p className="text-xs">Admin token: {localStorage.getItem('adminToken') ? 'Present' : 'Missing'}</p>
          <p className="text-xs">Events data: {events ? JSON.stringify(events.slice(0, 2), null, 2) : 'No data'}</p>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-6">
        {events && events.length > 0 ? events.map((event: Event) => {
          const eventImages = imagesByEvent[event.id] || [];
          const mainImage = eventImages.find(img => img.isMainImage);
          
          return (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="font-tech text-tech-dark text-xl">
                        {event.title}
                      </CardTitle>
                      {event.isGalleryOnly && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-tech">
                          <EyeOff className="h-3 w-3" />
                          Gallery Only
                        </div>
                      )}
                    </div>
                    <p className="text-tech-grey font-tech text-sm mt-1">
                      {event.location} • {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-tech-grey/70 font-tech text-xs mt-1">
                      {eventImages.length} gallery images
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToEvent(event.id)}
                      className="tech-gradient text-white font-tech"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                    <Button
                      onClick={() => handleBulkUpload(event.id)}
                      variant="outline"
                      size="sm"
                      className="font-tech"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {eventImages.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-tech-grey/30 rounded-lg">
                    <ImageIcon className="h-8 w-8 text-tech-grey/50 mx-auto mb-2" />
                    <p className="text-tech-grey font-tech text-sm">No gallery images for this event</p>
                                         <div className="flex gap-2 mt-2">
                       <Button
                         onClick={() => handleAddToEvent(event.id)}
                         variant="outline"
                         size="sm"
                         className="font-tech"
                       >
                         Add First Image
                       </Button>
                       <Button
                         onClick={() => handleBulkUpload(event.id)}
                         variant="outline"
                         size="sm"
                         className="font-tech"
                       >
                         <Upload className="h-3 w-3 mr-1" />
                         Bulk Upload
                       </Button>
                     </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {eventImages
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((image) => (
                        <div key={image.id} className="relative group">
                          <div className="relative">
                            <img
                              src={image.imageUrl}
                              alt={image.title}
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/150x100?text=Image+Not+Found";
                              }}
                            />
                            
                            {/* Main Image Badge */}
                            {image.isMainImage && (
                              <div className="absolute top-1 left-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleEdit(image)}
                                  className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(image.id)}
                                  className="h-6 w-6 p-0 bg-red-500/90 hover:bg-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-1">
                            <p className="text-xs font-tech text-tech-dark truncate">
                              {image.title}
                            </p>
                            <p className="text-xs text-tech-grey/70 font-tech">
                              Order: {image.displayOrder}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }) : (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-tech-grey/30 mx-auto mb-4" />
            <h3 className="text-lg font-tech text-tech-dark mb-2">No Events Found</h3>
            <p className="text-tech-grey font-tech mb-4">
              Create your first gallery event to get started
            </p>
            <Button
              onClick={handleCreateEvent}
              className="tech-gradient text-white font-tech"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Gallery Event
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Image Dialog */}
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-tech text-tech-dark">
              {editingImage ? "Edit Gallery Image" : "Add New Gallery Image"}
            </DialogTitle>
            <DialogDescription className="font-tech">
              {editingImage ? "Update the gallery image details" : "Add a new image to the event gallery"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tech-dark font-tech">Event</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingImage}>
                      <FormControl>
                        <SelectTrigger className="border-tech-grey/30 focus:border-tech-blue font-tech">
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events?.map((event: Event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tech-dark font-tech">Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Image title" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        {...field} 
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
                    <FormLabel className="text-tech-dark font-tech">Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        {...field} 
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
                    <FormLabel className="text-tech-dark font-tech">Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Image description" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isMainImage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-tech-grey/30"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-tech-dark font-tech">
                          Main Display Image
                        </FormLabel>
                        <p className="text-xs text-tech-grey font-tech">
                          This will be the main image shown for the event
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  className="font-tech"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="tech-gradient text-white font-tech"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={handleEventDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-tech text-tech-dark">
              Create Gallery Event
            </DialogTitle>
            <DialogDescription className="font-tech">
              Create a new event that will only appear in the gallery section
            </DialogDescription>
          </DialogHeader>
          <Form {...eventForm}>
            <form onSubmit={eventForm.handleSubmit(onEventSubmit)} className="space-y-4">
              <FormField
                control={eventForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tech-dark font-tech">Event Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Event title" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={eventForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tech-dark font-tech">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Event description" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={eventForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Event location" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={eventForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tech-dark font-tech">Event Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={eventForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tech-dark font-tech">Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="tag1, tag2, tag3" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-xs text-tech-grey font-tech">Separate tags with commas</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={eventForm.control}
                name="galleryImageUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tech-dark font-tech">Gallery Images (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        rows={6}
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-xs text-tech-grey font-tech">
                      Paste image URLs, one per line. The first image will be set as the main display image.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                <EyeOff className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-tech text-blue-800">
                    This event will be created as a gallery-only event
                  </p>
                  <p className="text-xs text-blue-600 font-tech">
                    It won't appear on the public events page, only in the gallery section
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEventDialogClose}
                  className="font-tech"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="tech-gradient text-white font-tech"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-tech text-tech-dark">
              Bulk Upload Images
            </DialogTitle>
            <DialogDescription className="font-tech">
              Add multiple images to this event by pasting image URLs (one per line)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-tech-dark font-tech text-sm font-medium">
                Image URLs (one per line)
              </label>
              <Textarea
                value={bulkImageUrls}
                onChange={(e) => setBulkImageUrls(e.target.value)}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                className="border-tech-grey/30 focus:border-tech-blue font-tech mt-2"
                rows={8}
              />
              <p className="text-xs text-tech-grey font-tech mt-1">
                Paste image URLs, one per line. The first image will be set as the main display image.
              </p>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <Upload className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-tech text-blue-800">
                  Bulk Upload Tips
                </p>
                <p className="text-xs text-blue-600 font-tech">
                  • Each URL should be on a separate line<br/>
                  • First image will be the main display image<br/>
                  • Images will be ordered automatically
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkUploadOpen(false)}
              className="font-tech"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkSubmit}
              className="tech-gradient text-white font-tech"
              disabled={bulkUploadMutation.isPending}
            >
              {bulkUploadMutation.isPending ? "Uploading..." : "Upload Images"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
