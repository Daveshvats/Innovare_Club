import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Users, 
  Eye,
  ExternalLink,
  Globe
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";

interface TechnofestEvent {
  id: string;
  slug?: string;
  name: string;
  number?: number;
  category: string;
  short_description: string;
  description: string;
  rules: string[];
  youtube_url?: string;
  team_min: number;
  team_max: number;
  spline_right_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  slug: string;
  number: number;
  category: string;
  shortDescription: string;
  description: string;
  rules: string[];
  youtubeUrl: string;
  teamMin: number;
  teamMax: number;
  splineRightUrl: string;
  isActive: boolean;
}

const CATEGORIES = ['Cultural', 'Sports', 'Technical'];

export default function AdminTechnofest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TechnofestEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<TechnofestEvent | null>(null);
  const [newRule, setNewRule] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    number: 1,
    category: "",
    shortDescription: "",
    description: "",
    rules: [],
    youtubeUrl: "",
    teamMin: 1,
    teamMax: 4,
    splineRightUrl: "",
    isActive: true,
  });

  // Fetch technofest events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/technofest"],
    queryFn: () => authenticatedRequest("/api/technofest"),
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return authenticatedRequest("/api/admin/technofest", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technofest"] });
      toast({
        title: "Success",
        description: "TechFest event created successfully",
      });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Failed to create event";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return authenticatedRequest(`/api/admin/technofest/${editingEvent?.id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technofest"] });
      toast({
        title: "Success",
        description: "TechFest event updated successfully",
      });
      setEditingEvent(null);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Failed to update event";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return authenticatedRequest(`/api/admin/technofest/${eventId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technofest"] });
      toast({
        title: "Success",
        description: "TechFest event deleted successfully",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Failed to delete event";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      number: 1,
      category: "",
      shortDescription: "",
      description: "",
      rules: [],
      youtubeUrl: "",
      teamMin: 1,
      teamMax: 4,
      splineRightUrl: "",
      isActive: true,
    });
    setNewRule("");
  };

  const handleCreate = () => {
    setEditingEvent(null);
    resetForm();
    setShowCreateDialog(true);
  };

  const handleEdit = (event: TechnofestEvent) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      slug: event.slug || "",
      number: event.number || 1,
      category: event.category,
      shortDescription: event.shortDescription,
      description: event.description,
      rules: event.rules || [],
      youtubeUrl: event.youtubeUrl || "",
      teamMin: event.teamMin,
      teamMax: event.teamMax,
      splineRightUrl: event.splineRightUrl || "",
      isActive: event.isActive,
    });
    setShowCreateDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category || !formData.shortDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.teamMin > formData.teamMax) {
      toast({
        title: "Error",
        description: "Minimum team size cannot be greater than maximum team size",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      name: formData.name.trim(),
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
    };

    if (editingEvent) {
      updateEventMutation.mutate(submitData);
    } else {
      createEventMutation.mutate(submitData);
    }
  };

  const handleDelete = (event: TechnofestEvent) => {
    if (window.confirm(`Are you sure you want to delete "${event.name}"?`)) {
      deleteEventMutation.mutate(event.id);
    }
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cultural':
        return 'bg-purple-100 text-purple-800';
      case 'Sports':
        return 'bg-green-100 text-green-800';
      case 'Technical':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-tech-light min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-tech-grey/20 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-tech-grey/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-tech-light min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-tech text-tech-dark">TechFest Events</h1>
          <p className="text-tech-grey mt-2 font-tech">Manage TechFest competition events</p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
          data-testid="button-add-technofest-event"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-tech-grey/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-tech text-tech-grey">Total Events</p>
                <p className="text-2xl font-bold font-tech text-tech-dark">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-tech-blue" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-tech-grey/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-tech text-tech-grey">Active Events</p>
                <p className="text-2xl font-bold font-tech text-tech-dark">{events.filter(e => e.isActive).length}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-tech-grey/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-tech text-tech-grey">Cultural</p>
                <p className="text-2xl font-bold font-tech text-tech-dark">{events.filter(e => e.category === 'Cultural').length}</p>
              </div>
              <div className="h-8 w-8 text-purple-600 flex items-center justify-center text-xl">🎭</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-tech-grey/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-tech text-tech-grey">Technical</p>
                <p className="text-2xl font-bold font-tech text-tech-dark">{events.filter(e => e.category === 'Technical').length}</p>
              </div>
              <div className="h-8 w-8 text-blue-600 flex items-center justify-center text-xl">💻</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="grid gap-4">
        {events.length > 0 ? (
          events.map((event: TechnofestEvent) => (
            <Card key={event.id} className="bg-white border-tech-grey/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-xl font-bold font-tech text-tech-dark">{event.name}</h3>
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                      <Badge variant={event.isActive ? "default" : "secondary"} className="font-tech">
                        {event.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {event.number && (
                        <Badge variant="outline" className="font-tech">
                          #{event.number}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-tech-grey font-tech">{event.shortDescription}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-tech-grey font-tech">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Team: {event.teamMin}-{event.teamMax}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.rules?.length || 0} rules
                      </div>
                      {event.splineRightUrl && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          3D Model
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingEvent(event)}
                      className="font-tech"
                      data-testid={`button-view-${event.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
                      onClick={() => handleDelete(event)}
                      className="text-red-600 hover:text-red-700 font-tech"
                      data-testid={`button-delete-${event.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white border-tech-grey/20">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-tech-grey mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-tech-dark font-tech mb-2">No TechFest events yet</h3>
              <p className="text-tech-grey font-tech mb-4">Create your first TechFest competition event</p>
              <Button onClick={handleCreate} className="bg-tech-blue hover:bg-tech-purple text-white font-tech">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-tech-dark font-tech">
              {editingEvent ? "Edit TechFest Event" : "Create TechFest Event"}
            </DialogTitle>
            <DialogDescription className="text-tech-grey font-tech">
              {editingEvent ? "Update event details" : "Create a new TechFest competition event"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-tech-dark font-tech">Event Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter event name"
                  className="border-tech-grey/30 focus:border-tech-blue font-tech"
                  required
                  data-testid="input-event-name"
                />
              </div>
              
              <div>
                <Label className="text-tech-dark font-tech">Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="event-slug (auto-generated if empty)"
                  className="border-tech-grey/30 focus:border-tech-blue font-tech"
                  data-testid="input-event-slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-tech-dark font-tech">Event Number</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: parseInt(e.target.value) || 1 }))}
                  className="border-tech-grey/30 focus:border-tech-blue font-tech"
                  data-testid="input-event-number"
                />
              </div>
              
              <div>
                <Label className="text-tech-dark font-tech">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="border-tech-grey/30 focus:border-tech-blue font-tech" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  data-testid="switch-is-active"
                />
                <Label className="text-tech-dark font-tech">Active</Label>
              </div>
            </div>

            <div>
              <Label className="text-tech-dark font-tech">Short Description *</Label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Brief description for event cards"
                className="border-tech-grey/30 focus:border-tech-blue font-tech"
                required
                data-testid="input-short-description"
              />
            </div>

            <div>
              <Label className="text-tech-dark font-tech">Full Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed event description"
                className="border-tech-grey/30 focus:border-tech-blue font-tech"
                rows={4}
                data-testid="textarea-description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-tech-dark font-tech">Min Team Size *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.teamMin}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamMin: parseInt(e.target.value) || 1 }))}
                  className="border-tech-grey/30 focus:border-tech-blue font-tech"
                  required
                  data-testid="input-team-min"
                />
              </div>
              
              <div>
                <Label className="text-tech-dark font-tech">Max Team Size *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.teamMax}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamMax: parseInt(e.target.value) || 1 }))}
                  className="border-tech-grey/30 focus:border-tech-blue font-tech"
                  required
                  data-testid="input-team-max"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-tech-dark font-tech">YouTube URL</Label>
                <Input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="border-tech-grey/30 focus:border-tech-blue font-tech"
                  data-testid="input-youtube-url"
                />
              </div>
              
              <div>
                <Label className="text-tech-dark font-tech">Spline 3D Model URL</Label>
                <Input
                  type="url"
                  value={formData.splineRightUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, splineRightUrl: e.target.value }))}
                  placeholder="https://prod.spline.design/..."
                  className="border-tech-grey/30 focus:border-tech-blue font-tech"
                  data-testid="input-spline-url"
                />
              </div>
            </div>

            {/* Rules Section */}
            <div>
              <Label className="text-tech-dark font-tech">Rules & Guidelines</Label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a rule"
                    className="border-tech-grey/30 focus:border-tech-blue font-tech"
                    data-testid="input-new-rule"
                  />
                  <Button 
                    type="button" 
                    onClick={addRule}
                    className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
                    data-testid="button-add-rule"
                  >
                    Add
                  </Button>
                </div>
                {formData.rules.length > 0 && (
                  <div className="space-y-1">
                    {formData.rules.map((rule, index) => (
                      <div key={index} className="flex items-center justify-between bg-tech-light p-2 rounded">
                        <span className="text-tech-dark font-tech text-sm">{rule}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRule(index)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-remove-rule-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="font-tech"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
                disabled={createEventMutation.isPending || updateEventMutation.isPending}
                data-testid="button-submit"
              >
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      {viewingEvent && (
        <Dialog open={!!viewingEvent} onOpenChange={() => setViewingEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-tech-dark font-tech">{viewingEvent.name}</DialogTitle>
              <div className="flex space-x-2">
                <Badge className={getCategoryColor(viewingEvent.category)}>
                  {viewingEvent.category}
                </Badge>
                <Badge variant={viewingEvent.isActive ? "default" : "secondary"} className="font-tech">
                  {viewingEvent.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-tech font-semibold text-tech-dark">Description</h4>
                <p className="text-tech-grey font-tech">{viewingEvent.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-tech font-semibold text-tech-dark">Team Size</h4>
                  <p className="text-tech-grey font-tech">{viewingEvent.teamMin} - {viewingEvent.teamMax} members</p>
                </div>
                <div>
                  <h4 className="font-tech font-semibold text-tech-dark">Event Number</h4>
                  <p className="text-tech-grey font-tech">#{viewingEvent.number || 'N/A'}</p>
                </div>
              </div>
              
              {viewingEvent.rules && viewingEvent.rules.length > 0 && (
                <div>
                  <h4 className="font-tech font-semibold text-tech-dark">Rules & Guidelines</h4>
                  <ul className="list-disc list-inside space-y-1 text-tech-grey font-tech">
                    {viewingEvent.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex space-x-4 pt-4">
                {viewingEvent.youtubeUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(viewingEvent.youtubeUrl, '_blank')}
                    className="font-tech"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Video
                  </Button>
                )}
                {viewingEvent.splineRightUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(viewingEvent.splineRightUrl, '_blank')}
                    className="font-tech"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    View 3D Model
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}