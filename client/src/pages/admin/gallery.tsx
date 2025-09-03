import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
}

const galleryImageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
});

type GalleryImageFormData = z.infer<typeof galleryImageSchema>;

export default function AdminGallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  const { data: galleryImages, isLoading } = useQuery({
    queryKey: ["/api/gallery"],
    queryFn: () => apiRequest<GalleryImage[]>("/api/gallery", "GET"),
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
      return await apiRequest("/api/admin/gallery", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsOpen(false);
      setEditingImage(null);
      form.reset();
      toast({
        title: "Success",
        description: "Gallery image created successfully",
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
      return await apiRequest(`/api/admin/gallery/${editingImage?.id}`, "PATCH", data);
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
      return await apiRequest(`/api/admin/gallery/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
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

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    form.reset({
      title: image.title,
      imageUrl: image.imageUrl,
      description: image.description || "",
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this gallery image?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setEditingImage(null);
    form.reset();
  };

  const onSubmit = (data: GalleryImageFormData) => {
    if (editingImage) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-tech-dark font-tech">Gallery Management</h1>
          <p className="text-tech-grey font-tech">Manage gallery images for the website</p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-40 sm:h-48 bg-gray-300 rounded-t-lg"></div>
              <CardContent className="p-3 sm:p-4">
                <div className="h-3 sm:h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-2 sm:h-3 bg-gray-300 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {galleryImages?.map((image) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(image)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-tech font-semibold text-tech-dark mb-2">{image.title}</h3>
                {image.description && (
                  <p className="text-tech-grey text-sm font-tech line-clamp-2">{image.description}</p>
                )}
                <p className="text-xs text-tech-grey mt-2 font-tech">
                  Added: {new Date(image.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-tech">
              {editingImage ? "Edit Gallery Image" : "Add Gallery Image"}
            </DialogTitle>
            <DialogDescription className="font-tech">
              {editingImage ? "Update the gallery image details." : "Add a new image to the gallery."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-tech">Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                className="font-tech"
                placeholder="Enter image title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 font-tech">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="font-tech">Image URL</Label>
              <Input
                id="imageUrl"
                {...form.register("imageUrl")}
                className="font-tech"
                placeholder="https://example.com/image.jpg"
              />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-red-500 font-tech">{form.formState.errors.imageUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-tech">Description (Optional)</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                className="font-tech"
                placeholder="Enter image description"
                rows={3}
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
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingImage
                  ? "Update"
                  : "Add Image"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}