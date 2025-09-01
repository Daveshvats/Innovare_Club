import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/api";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Calendar,
  Star,
  AlertTriangle
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAnnouncements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isImportant: false,
  });

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: () => authenticatedRequest("/api/announcements"),
  });

  // Create announcement mutation
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      return authenticatedRequest("/api/admin/announcements", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Failed to create announcement";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      return authenticatedRequest(`/api/admin/announcements/${editingAnnouncement?.id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      setEditingAnnouncement(null);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Failed to update announcement";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      return authenticatedRequest(`/api/admin/announcements/${announcementId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      isImportant: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate(formData);
    } else {
      createAnnouncementMutation.mutate(formData);
    }
  };

const handleEdit = (announcement: Announcement) => {
  setEditingAnnouncement(announcement);
  setFormData({
    title: announcement.title,
    content: announcement.content,
    isImportant: announcement.isImportant,
  });
  setShowCreateDialog(true); // <-- This opens the dialog for edit!
};

  const handleDelete = (announcementId: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncementMutation.mutate(announcementId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6 bg-tech-light min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Announcement Management</h1>
          <p className="text-tech-grey mt-2 font-tech">Create and manage community announcements</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-tech-blue hover:bg-tech-purple text-white font-tech">
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-tech">
                {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
              </DialogTitle>
              <DialogDescription className="font-tech">
                {editingAnnouncement ? "Update the announcement details" : "Share important information with the community"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="font-tech">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter announcement title"
                  className="font-tech"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content" className="font-tech">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter announcement content"
                  className="font-tech"
                  rows={6}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isImportant"
                  checked={formData.isImportant}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isImportant: checked }))}
                />
                <Label htmlFor="isImportant" className="font-tech flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Mark as important
                </Label>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingAnnouncement(null);
                    resetForm();
                  }}
                  className="font-tech"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
                  disabled={createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending}
                >
                  {createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending ? "Saving..." : "Save Announcement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-blue mx-auto"></div>
          <p className="text-tech-grey mt-2 font-tech">Loading announcements...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement: Announcement) => (
            <Card key={announcement.id} className="bg-white border-tech-grey/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-tech text-tech-dark flex items-center gap-2">
                      {announcement.title}
                      {announcement.isImportant && (
                        <Star className="h-5 w-5 text-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="font-tech text-tech-grey mt-1">
                      By {announcement.createdBy}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={announcement.isImportant ? "default" : "secondary"}
                    className="ml-2 font-tech"
                  >
                    {announcement.isImportant ? "Important" : "Regular"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-tech-dark font-tech line-clamp-3">
                  {announcement.content}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-tech-grey font-tech">
                  <Calendar className="h-4 w-4" />
                  {formatDate(announcement.createdAt)}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                    className="flex-1 font-tech"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-600 hover:text-red-700 font-tech"
                    disabled={deleteAnnouncementMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {announcements.length === 0 && !isLoading && (
        <Card className="bg-white border-tech-grey/20">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-tech-grey mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-tech-dark font-tech mb-2">No announcements yet</h3>
            <p className="text-tech-grey font-tech">Create your first announcement to keep the community informed</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
