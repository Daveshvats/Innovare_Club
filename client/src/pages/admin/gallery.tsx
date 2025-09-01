import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
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

const galleryImageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  description: z.string().optional(),
});

type GalleryImageFormData = z.infer<typeof galleryImageSchema>;

export default function AdminGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const { toast } = useToast();

  const { data: galleryImages, isLoading } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const form = useForm<GalleryImageFormData>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GalleryImageFormData) => {
      return await apiRequest("/api/gallery", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsOpen(false);
      setEditingImage(null);
      form.reset();
      toast({
        title: "Success",
        description: "Image added to gallery successfully",
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
    mutationFn: async (data: GalleryImageFormData) => {
      return await apiRequest(`/api/gallery/${editingImage.id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
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
      return await apiRequest(`/api/gallery/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Success",
        description: "Image removed from gallery successfully",
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

  const handleEdit = (image: any) => {
    setEditingImage(image);
    form.reset({
      title: image.title,
      imageUrl: image.imageUrl,
      description: image.description || "",
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this image from the gallery?")) {
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

  if (isLoading) {
    return (
      <div className="p-6 bg-tech-light min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-tech-grey/20 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-tech-grey/20 rounded"></div>
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
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Gallery Management</h1>
          <p className="text-tech-grey mt-2 font-tech">Manage club gallery images</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-tech-blue hover:bg-tech-purple text-white font-tech" data-testid="button-add-image">
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-tech-dark font-tech">
                {editingImage ? "Edit Gallery Image" : "Add New Image"}
              </DialogTitle>
              <DialogDescription className="text-tech-grey font-tech">
                {editingImage ? "Update image details" : "Add a new image to the gallery"}
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
                          placeholder="Image title" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-image-title"
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
                          data-testid="input-image-url"
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
                          placeholder="Brief description of the image" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-image-description"
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
                    data-testid="button-save-image"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? "Saving..." 
                      : editingImage 
                        ? "Update" 
                        : "Add"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(galleryImages) && galleryImages.length > 0 ? (
          galleryImages.map((image: any) => (
            <Card key={image.id} className="bg-white border-tech-grey/20 overflow-hidden" data-testid={`card-image-${image.id}`}>
              <div className="aspect-video relative">
                <img 
                  src={image.imageUrl} 
                  alt={image.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjhmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-tech-dark font-tech">{image.title}</CardTitle>
                {image.description && (
                  <p className="text-tech-grey text-sm font-tech">{image.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(image)}
                    className="font-tech"
                    data-testid={`button-edit-${image.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(image.id)}
                    className="text-red-600 hover:text-red-700 font-tech"
                    data-testid={`button-delete-${image.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="bg-white border-tech-grey/20">
              <CardContent className="p-8 text-center">
                <ImageIcon className="h-12 w-12 text-tech-grey mx-auto mb-4" />
                <p className="text-tech-grey font-tech">No images found. Add your first image to the gallery!</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}