import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/api";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Vote, 
  Calendar,
  Users,
  BarChart3
} from "lucide-react";

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalVotes?: number;
}

export default function AdminPolls() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    options: [""],
  });

  // Fetch polls
  const { data: polls = [], isLoading } = useQuery({
    queryKey: ["/api/polls"],
    queryFn: () => authenticatedRequest("/api/polls"),
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (data: any) => {
      return authenticatedRequest("/api/admin/polls", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Success",
        description: "Poll created successfully",
      });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Failed to create poll";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update poll mutation
  const updatePollMutation = useMutation({
    mutationFn: async (data: any) => {
      return authenticatedRequest(`/api/admin/polls/${editingPoll?.id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Success",
        description: "Poll updated successfully",
      });
      setEditingPoll(null);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Failed to update poll";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete poll mutation
  const deletePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      return authenticatedRequest(`/api/admin/polls/${pollId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Success",
        description: "Poll deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete poll",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      options: [""],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.options.length < 2) {
      toast({
        title: "Error",
        description: "Poll must have at least 2 options",
        variant: "destructive",
      });
      return;
    }

    if (editingPoll) {
      updatePollMutation.mutate(formData);
    } else {
      createPollMutation.mutate(formData);
    }
  };

  const handleEdit = (poll: Poll) => {
    setEditingPoll(poll);
    setFormData({
      title: poll.title,
      description: poll.description || "",
      options: poll.options,
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option),
    }));
  };

  const handleDelete = (pollId: string) => {
    if (confirm("Are you sure you want to delete this poll?")) {
      deletePollMutation.mutate(pollId);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-tech-light min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Poll Management</h1>
          <p className="text-tech-grey mt-2 font-tech">Create and manage community polls</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-tech-blue hover:bg-tech-purple text-white font-tech">
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-tech">
                {editingPoll ? "Edit Poll" : "Create New Poll"}
              </DialogTitle>
              <DialogDescription className="font-tech">
                {editingPoll ? "Update the poll details" : "Add a new poll for the community"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="font-tech">Poll Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter poll title"
                  className="font-tech"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="font-tech">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter poll description"
                  className="font-tech"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="font-tech">Poll Options</Label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="font-tech"
                        required
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full font-tech"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingPoll(null);
                    resetForm();
                  }}
                  className="font-tech"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
                  disabled={createPollMutation.isPending || updatePollMutation.isPending}
                >
                  {createPollMutation.isPending || updatePollMutation.isPending ? "Saving..." : "Save Poll"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Polls Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-blue mx-auto"></div>
          <p className="text-tech-grey mt-2 font-tech">Loading polls...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll: Poll) => (
            <Card key={poll.id} className="bg-white border-tech-grey/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-tech text-tech-dark">{poll.title}</CardTitle>
                    {poll.description && (
                      <CardDescription className="font-tech text-tech-grey mt-1">
                        {poll.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge 
                    variant={poll.isActive ? "default" : "secondary"}
                    className="ml-2 font-tech"
                  >
                    {poll.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-tech-grey font-tech">
                    <Vote className="h-4 w-4" />
                    {poll.options.length} options
                  </div>
                  <div className="flex items-center gap-2 text-sm text-tech-grey font-tech">
                    <Users className="h-4 w-4" />
                    {poll.totalVotes || 0} votes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-tech-grey font-tech">
                    <Calendar className="h-4 w-4" />
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(poll)}
                    className="flex-1 font-tech"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(poll.id)}
                    className="text-red-600 hover:text-red-700 font-tech"
                    disabled={deletePollMutation.isPending}
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

      {polls.length === 0 && !isLoading && (
        <Card className="bg-white border-tech-grey/20">
          <CardContent className="text-center py-12">
            <Vote className="h-12 w-12 text-tech-grey mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-tech-dark font-tech mb-2">No polls yet</h3>
            <p className="text-tech-grey font-tech">Create your first poll to engage the community</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
