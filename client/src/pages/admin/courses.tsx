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
  BookOpen, 
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";

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

export default function AdminCourses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseLibrary | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    courseUrl: "",
    isActive: true,
  });

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/course-library"],
    queryFn: () => authenticatedRequest("/api/course-library"),
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      return authenticatedRequest("/api/admin/course-library", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-library"] });
      toast({
        title: "Success",
        description: "Course added successfully",
      });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Failed to add course";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      return authenticatedRequest(`/api/admin/course-library/${editingCourse?.id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-library"] });
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      setEditingCourse(null);
      
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || "Failed to update course";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return authenticatedRequest(`/api/admin/course-library/${courseId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-library"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      courseUrl: "",
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCourse) {
      updateCourseMutation.mutate(formData);
    } else {
      createCourseMutation.mutate(formData);
    }
  };

  const handleEdit = (course: CourseLibrary) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      imageUrl: course.imageUrl || "",
      courseUrl: course.courseUrl,
      isActive: course.isActive,
    });
     setShowCreateDialog(true);
  };

  const handleDelete = (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6 bg-tech-light min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Course Library Management</h1>
          <p className="text-tech-grey mt-2 font-tech">Add and manage educational resources</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-tech-blue hover:bg-tech-purple text-white font-tech">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-tech">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </DialogTitle>
              <DialogDescription className="font-tech">
                {editingCourse ? "Update the course details" : "Add a new educational resource to the library"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="font-tech">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                  className="font-tech"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="font-tech">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter course description"
                  className="font-tech"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl" className="font-tech">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Enter image URL"
                  className="font-tech"
                />
              </div>
              
              <div>
                <Label htmlFor="courseUrl" className="font-tech">Course URL</Label>
                <Input
                  id="courseUrl"
                  value={formData.courseUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseUrl: e.target.value }))}
                  placeholder="Enter course URL"
                  className="font-tech"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive" className="font-tech">Active</Label>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingCourse(null);
                    resetForm();
                  }}
                  className="font-tech"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
                  disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                >
                  {createCourseMutation.isPending || updateCourseMutation.isPending ? "Saving..." : "Save Course"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-blue mx-auto"></div>
          <p className="text-tech-grey mt-2 font-tech">Loading courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: CourseLibrary) => (
            <Card key={course.id} className="bg-white border-tech-grey/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-tech text-tech-dark">{course.title}</CardTitle>
                    {course.description && (
                      <CardDescription className="font-tech text-tech-grey mt-1">
                        {course.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge 
                    variant={course.isActive ? "default" : "secondary"}
                    className="ml-2 font-tech"
                  >
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {course.imageUrl && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-tech-grey font-tech">
                    <BookOpen className="h-4 w-4" />
                    Added by {course.createdBy}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-tech-grey font-tech">
                    <Calendar className="h-4 w-4" />
                    {formatDate(course.createdAt)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(course.courseUrl, '_blank')}
                    className="flex-1 font-tech"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Course
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(course)}
                    className="font-tech"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                    className="text-red-600 hover:text-red-700 font-tech"
                    disabled={deleteCourseMutation.isPending}
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

      {courses.length === 0 && !isLoading && (
        <Card className="bg-white border-tech-grey/20">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-tech-grey mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-tech-dark font-tech mb-2">No courses yet</h3>
            <p className="text-tech-grey font-tech">Add your first course to build the learning library</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
