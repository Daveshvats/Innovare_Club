import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Vote, 
  MessageSquare, 
  BookOpen,
  ExternalLink,
  Image as ImageIcon
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
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CourseLibrary {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  courseUrl: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CommunityManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("polls");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    options: [""],
    imageUrl: "",
    courseUrl: "",
    isActive: true,
    isImportant: false,
  });

  // Fetch data
  const { data: polls } = useQuery({
    queryKey: ["/api/polls"],
  });

  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const { data: courseLibrary } = useQuery({
    queryKey: ["/api/course-library"],
  });

  // Mutations
  const createPollMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create poll");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({ title: "Success", description: "Poll created successfully!" });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create poll", variant: "destructive" });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create announcement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Success", description: "Announcement created successfully!" });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create announcement", variant: "destructive" });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/course-library", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create course");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-library"] });
      toast({ title: "Success", description: "Course created successfully!" });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to delete ${type}`);
      return response.json();
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type}`] });
      toast({ title: "Success", description: `${type} deleted successfully!` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      options: [""],
      imageUrl: "",
      courseUrl: "",
      isActive: true,
      isImportant: false,
    });
    setEditingItem(null);
  };

  const handleCreate = () => {
    if (activeTab === "polls") {
      if (!formData.title || formData.options.length < 2) {
        toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
        return;
      }
      createPollMutation.mutate({
        title: formData.title,
        description: formData.description,
        options: formData.options.filter(opt => opt.trim()),
        isActive: formData.isActive,
      });
    } else if (activeTab === "announcements") {
      if (!formData.title || !formData.content) {
        toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
        return;
      }
      createAnnouncementMutation.mutate({
        title: formData.title,
        content: formData.content,
        isImportant: formData.isImportant,
      });
    } else if (activeTab === "courses") {
      if (!formData.title || !formData.courseUrl) {
        toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
        return;
      }
      createCourseMutation.mutate({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        courseUrl: formData.courseUrl,
        isActive: formData.isActive,
      });
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-tech-light pt-20">
      <div className="responsive-container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-tech text-4xl md:text-5xl font-bold text-tech-dark mb-4">
            Community Management
          </h1>
          <p className="text-lg text-tech-grey max-w-2xl mx-auto">
            Manage polls, announcements, and course library for the community.
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border-tech-grey/20">
            <TabsTrigger value="polls" className="flex items-center space-x-2">
              <Vote className="h-4 w-4" />
              <span>Polls</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Announcements</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Course Library</span>
            </TabsTrigger>
          </TabsList>

          {/* Polls Tab */}
          <TabsContent value="polls" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-tech-dark">Active Polls</h2>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setActiveTab("polls")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Poll
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Poll</DialogTitle>
                    <DialogDescription>
                      Create a new poll for the community to vote on.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="poll-title">Poll Title *</Label>
                      <Input
                        id="poll-title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="What's your favorite programming language?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="poll-description">Description</Label>
                      <Textarea
                        id="poll-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description for the poll"
                      />
                    </div>
                    <div>
                      <Label>Poll Options *</Label>
                      <div className="space-y-2">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            {formData.options.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" onClick={addOption}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="poll-active"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <Label htmlFor="poll-active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={createPollMutation.isPending}>
                      {createPollMutation.isPending ? "Creating..." : "Create Poll"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-6">
              {Array.isArray(polls) && polls.length > 0 ? (
                polls.map((poll: Poll) => (
                  <Card key={poll.id} className="bg-white border-tech-grey/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-tech-dark">{poll.title}</CardTitle>
                          {poll.description && (
                            <CardDescription className="text-tech-grey mt-2">
                              {poll.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={poll.isActive ? "default" : "secondary"}>
                            {poll.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteMutation.mutate({ type: "polls", id: poll.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {poll.options.map((option, index) => (
                          <div key={index} className="text-sm text-tech-grey">
                            {index + 1}. {option}
                          </div>
                        ))}
                        <div className="text-xs text-tech-grey mt-4">
                          Created {formatDate(poll.createdAt)} • {poll.options.length} options
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white border-tech-grey/20">
                  <CardContent className="p-8 text-center">
                    <Vote className="h-12 w-12 text-tech-grey mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-tech-dark mb-2">No Polls Available</h3>
                    <p className="text-tech-grey">Create your first poll to engage the community.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-tech-dark">Latest Announcements</h2>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setActiveTab("announcements")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Announcement</DialogTitle>
                    <DialogDescription>
                      Post a new announcement for the community.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="announcement-title">Title *</Label>
                      <Input
                        id="announcement-title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Important announcement title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="announcement-content">Content *</Label>
                      <Textarea
                        id="announcement-content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Announcement content..."
                        rows={6}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="announcement-important"
                        checked={formData.isImportant}
                        onChange={(e) => setFormData(prev => ({ ...prev, isImportant: e.target.checked }))}
                      />
                      <Label htmlFor="announcement-important">Mark as Important</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={createAnnouncementMutation.isPending}>
                      {createAnnouncementMutation.isPending ? "Posting..." : "Post Announcement"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-6">
              {Array.isArray(announcements) && announcements.length > 0 ? (
                announcements.map((announcement: Announcement) => (
                  <Card key={announcement.id} className="bg-white border-tech-grey/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-tech-dark flex items-center space-x-2">
                            {announcement.title}
                            {announcement.isImportant && (
                              <Badge variant="destructive">Important</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-tech-grey mt-2">
                            Posted {formatDate(announcement.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteMutation.mutate({ type: "announcements", id: announcement.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-tech-dark leading-relaxed">
                        {announcement.content}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white border-tech-grey/20">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-tech-grey mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-tech-dark mb-2">No Announcements</h3>
                    <p className="text-tech-grey">Post your first announcement to keep the community informed.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Course Library Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-tech-dark">Course Library</h2>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setActiveTab("courses")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>
                      Add a new course to the library with image and access URL.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="course-title">Course Title *</Label>
                      <Input
                        id="course-title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Introduction to React"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-description">Description</Label>
                      <Textarea
                        id="course-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Course description..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-image">Image URL</Label>
                      <Input
                        id="course-image"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-url">Course URL *</Label>
                      <Input
                        id="course-url"
                        value={formData.courseUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, courseUrl: e.target.value }))}
                        placeholder="https://course-platform.com/course/123"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="course-active"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <Label htmlFor="course-active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={createCourseMutation.isPending}>
                      {createCourseMutation.isPending ? "Adding..." : "Add Course"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(courseLibrary) && courseLibrary.length > 0 ? (
                courseLibrary.map((course: CourseLibrary) => (
                  <Card key={course.id} className="bg-white border-tech-grey/20">
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {course.imageUrl ? (
                          <img 
                            src={course.imageUrl} 
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <CardTitle className="text-lg text-tech-dark">{course.title}</CardTitle>
                      {course.description && (
                        <CardDescription className="text-tech-grey">
                          {course.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-tech-grey">
                          <span>Added {formatDate(course.createdAt)}</span>
                          <Badge variant={course.isActive ? "default" : "secondary"}>
                            {course.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(course.courseUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Course
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteMutation.mutate({ type: "course-library", id: course.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white border-tech-grey/20 md:col-span-2 lg:col-span-3">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-tech-grey mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-tech-dark mb-2">No Courses Available</h3>
                    <p className="text-tech-grey">Add your first course to start building the library.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
