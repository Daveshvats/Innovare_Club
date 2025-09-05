import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { useCacheInvalidation, defaultQueryOptions } from "@/lib/cache-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, User } from "lucide-react";
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

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

export default function AdminTeam() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const { toast } = useToast();
  const { invalidateTeamRelated } = useCacheInvalidation();

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["/api/team"],
    ...defaultQueryOptions,
  });

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      position: "",
      description: "",
      imageUrl: "",
      socialLinks: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        github: "",
      },
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      return await apiRequest("/api/team", "POST", data);
    },
    onSuccess: async () => {
      await invalidateTeamRelated();
      setIsOpen(false);
      setEditingMember(null);
      form.reset();
      toast({
        title: "Success",
        description: "Team member added successfully",
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
    mutationFn: async (data: TeamMemberFormData) => {
      return await apiRequest(`/api/team/${editingMember.id}`, "PATCH", data);
    },
    onSuccess: async () => {
      await invalidateTeamRelated();
      setIsOpen(false);
      setEditingMember(null);
      form.reset();
      toast({
        title: "Success",
        description: "Team member updated successfully",
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
      return await apiRequest(`/api/team/${id}`, "DELETE");
    },
    onSuccess: async () => {
      await invalidateTeamRelated();
      toast({
        title: "Success",
        description: "Team member removed successfully",
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

  const handleEdit = (member: any) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      position: member.position,
      description: member.description,
      imageUrl: member.imageUrl || "",
      socialLinks: {
        facebook: member.socialLinks?.facebook || "",
        twitter: member.socialLinks?.twitter || "",
        instagram: member.socialLinks?.instagram || "",
        linkedin: member.socialLinks?.linkedin || "",
        github: member.socialLinks?.github || "",
      },
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: TeamMemberFormData) => {
    if (editingMember) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setEditingMember(null);
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
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Team Management</h1>
          <p className="text-tech-grey mt-2 font-tech">Manage club team members</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-tech-blue hover:bg-tech-purple text-white font-tech" data-testid="button-add-member">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-tech-dark font-tech">
                {editingMember ? "Edit Team Member" : "Add New Team Member"}
              </DialogTitle>
              <DialogDescription className="text-tech-grey font-tech">
                {editingMember ? "Update member details" : "Add a new member to your team"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Member name" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-member-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-tech-dark font-tech">Position</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., President, Vice President, Secretary" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-member-position"
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
                          placeholder="Brief description about the member" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-member-description"
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
                          placeholder="https://example.com/photo.jpg" 
                          className="border-tech-grey/30 focus:border-tech-blue font-tech"
                          {...field} 
                          data-testid="input-member-image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Social Links Section */}
                <div className="space-y-4">
                  <h4 className="text-tech-dark font-tech font-medium">Social Links (Optional)</h4>
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-tech-dark font-tech">Facebook</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://facebook.com/username" 
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
                    name="socialLinks.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-tech-dark font-tech">Twitter</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://twitter.com/username" 
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
                    name="socialLinks.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-tech-dark font-tech">Instagram</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://instagram.com/username" 
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
                    name="socialLinks.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-tech-dark font-tech">LinkedIn</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://linkedin.com/in/username" 
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
                    name="socialLinks.github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-tech-dark font-tech">GitHub</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://github.com/username" 
                            className="border-tech-grey/30 focus:border-tech-blue font-tech"
                            {...field} 
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
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
                    data-testid="button-save-member"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? "Saving..." 
                      : editingMember 
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
        {Array.isArray(teamMembers) && teamMembers.length > 0 ? (
          teamMembers.map((member: any) => (
            <Card key={member.id} className="bg-white border-tech-grey/20" data-testid={`card-member-${member.id}`}>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={member.imageUrl} alt={member.name} />
                  <AvatarFallback className="bg-tech-blue text-white">
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-tech-dark font-tech">{member.name}</CardTitle>
                <p className="text-tech-blue font-tech font-medium">{member.position}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-tech-grey text-sm font-tech">{member.description}</p>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                    className="font-tech"
                    data-testid={`button-edit-${member.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-700 font-tech"
                    data-testid={`button-delete-${member.id}`}
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
                <User className="h-12 w-12 text-tech-grey mx-auto mb-4" />
                <p className="text-tech-grey font-tech">No team members found. Add your first team member!</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}