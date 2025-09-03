import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText } from "lucide-react";
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

const aboutContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().optional(),
});

type AboutContentFormData = z.infer<typeof aboutContentSchema>;

export default function AdminAbout() {
  const { toast } = useToast();

  const { data: aboutContent, isLoading } = useQuery({
    queryKey: ["/api/admin/about"],
  });

  const form = useForm<AboutContentFormData>({
    resolver: zodResolver(aboutContentSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AboutContentFormData) => {
      return await apiRequest("/api/admin/about/hero", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/about"] });
      toast({
        title: "Success",
        description: "About content updated successfully",
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

  // Set form values when data loads
  useEffect(() => {
    if (Array.isArray(aboutContent) && aboutContent.length > 0) {
      const heroContent = aboutContent.find((content: any) => content.section === "hero") || aboutContent[0];
      if (heroContent) {
        form.reset({
          title: heroContent.title || "",
          content: heroContent.content || "",
          imageUrl: heroContent.imageUrl || "",
        });
      }
    }
  }, [aboutContent, form]);

  const onSubmit = (data: AboutContentFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-tech-light min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-tech-grey/20 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-tech-grey/20 rounded"></div>
            <div className="h-20 bg-tech-grey/20 rounded"></div>
            <div className="h-10 bg-tech-grey/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-tech-light min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-tech text-tech-dark">About Us Content</h1>
          <p className="text-tech-grey mt-2 font-tech">Manage the about us section content</p>
        </div>
      </div>

      <Card className="bg-white border-tech-grey/20 max-w-4xl">
        <CardHeader>
          <CardTitle className="text-tech-dark font-tech flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Hero Section Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tech-dark font-tech">Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="About section title" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        {...field} 
                        data-testid="input-about-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tech-dark font-tech">Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="About section content" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech min-h-[200px]"
                        {...field} 
                        data-testid="input-about-content"
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
                    <FormLabel className="text-tech-dark font-tech">Background Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/background.jpg" 
                        className="border-tech-grey/30 focus:border-tech-blue font-tech"
                        {...field} 
                        data-testid="input-about-image"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
                  data-testid="button-save-about"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="bg-white border-tech-grey/20 max-w-4xl">
        <CardHeader>
          <CardTitle className="text-tech-dark font-tech">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-tech-light rounded-lg border">
            <h2 className="text-2xl font-bold font-tech text-tech-dark mb-4">
              {form.watch("title") || "About Section Title"}
            </h2>
            <p className="text-tech-grey font-tech leading-relaxed">
              {form.watch("content") || "About section content will appear here..."}
            </p>
            {form.watch("imageUrl") && (
              <div className="mt-4">
                <img 
                  src={form.watch("imageUrl")} 
                  alt="Background preview" 
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}