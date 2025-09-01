import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Vote, 
  BookOpen, 
  Plus, 
  Calendar, 
  User,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface PollResponse {
  id: string;
  pollId: string;
  username: string;
  selectedOption: number;
  createdAt: string;
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

interface AnnouncementReply {
  id: string;
  announcementId: string;
  username: string;
  content: string;
  createdAt: string;
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

export default function Community() {
  const { toast } = useToast();
  const { user, isAuthenticated, mockLogin, logout } = useAuth();
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [newPollResponse, setNewPollResponse] = useState<number>(-1);
  const [newReply, setNewReply] = useState("");
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [showAnnouncementDetails, setShowAnnouncementDetails] = useState(false);
  const [showPollDetails, setShowPollDetails] = useState(false);
  const [announcementReplies, setAnnouncementReplies] = useState<AnnouncementReply[]>([]);
  const [pollResponses, setPollResponses] = useState<PollResponse[]>([]);

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

  // Fetch announcement replies
  const fetchAnnouncementReplies = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/announcements/${announcementId}/replies`);
      if (response.ok) {
        const replies = await response.json();
        setAnnouncementReplies(replies);
      }
    } catch (error) {
      console.error("Failed to fetch announcement replies:", error);
    }
  };

  // Fetch poll responses
  const fetchPollResponses = async (pollId: string) => {
    try {
      const response = await fetch(`/api/polls/${pollId}/responses`);
      if (response.ok) {
        const responses = await response.json();
        setPollResponses(responses);
      }
    } catch (error) {
      console.error("Failed to fetch poll responses:", error);
    }
  };

  const handlePollVote = async (pollId: string, selectedOption: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote in polls.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/polls/${pollId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user?.username,
          selectedOption,
        }),
      });

      if (response.ok) {
        toast({
          title: "Vote Recorded",
          description: "Your vote has been recorded successfully!",
        });
        // Refresh polls data
        window.location.reload();
      } else {
        throw new Error("Failed to record vote");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnnouncementReply = async (announcementId: string, content: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reply to announcements.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/announcements/${announcementId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user?.username,
          content,
        }),
      });

             if (response.ok) {
         toast({
           title: "Reply Posted",
           description: "Your reply has been posted successfully!",
         });
         setNewReply("");
         setShowReplyDialog(false);
         // Refresh replies if viewing announcement details
         if (selectedAnnouncement) {
           fetchAnnouncementReplies(selectedAnnouncement.id);
         }
       } else {
        throw new Error("Failed to post reply");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: "destructive",
      });
    }
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
            Community Hub
          </h1>
          <p className="text-lg text-tech-grey max-w-2xl mx-auto">
            Connect with fellow innovators, participate in polls, stay updated with announcements, and access our course library.
          </p>
          {isAuthenticated && (
            <div className="mt-4 flex items-center justify-center space-x-4">
              <span className="text-sm text-tech-grey">
                Welcome, <span className="font-semibold text-tech-blue">{user?.username}</span>!
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>

        {/* Authentication Notice */}
        {!isAuthenticated && (
          <Card className="mb-8 bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <User className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800">Sign In Required</h3>
                    <p className="text-yellow-700 text-sm">
                      To participate in polls, reply to announcements, and access the course library, please sign in to your account.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href="/user/login">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-tech-blue hover:bg-tech-purple text-white border-tech-blue"
                    >
                      Sign In
                    </Button>
                  </Link>

                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="polls" className="space-y-6">
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
            </div>
            
            <div className="grid gap-6">
              {Array.isArray(polls) && polls.length > 0 ? (
                polls.map((poll: Poll) => (
                  <Card key={poll.id} className="bg-white border-tech-grey/20 hover-lift">
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
                        <Badge variant={poll.isActive ? "default" : "secondary"}>
                          {poll.isActive ? "Active" : "Closed"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                                                 {poll.options.map((option, index) => (
                           <div key={index} className="flex items-center space-x-3">
                             <Button
                               variant="outline"
                               className="flex-1 justify-start h-auto py-3 px-4 text-left"
                               onClick={() => {
                                 setSelectedPoll(poll);
                                 setNewPollResponse(index);
                                 setShowPollDialog(true);
                               }}
                               disabled={!isAuthenticated || !poll.isActive}
                             >
                               <Vote className="h-4 w-4 mr-2" />
                               {option}
                             </Button>
                           </div>
                         ))}
                         <div className="flex justify-between items-center pt-2">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => {
                               setSelectedPoll(poll);
                               fetchPollResponses(poll.id);
                               setShowPollDetails(true);
                             }}
                             className="flex items-center space-x-2"
                           >
                             <Vote className="h-4 w-4" />
                             <span>View Responses</span>
                           </Button>
                         </div>
                        <div className="flex items-center justify-between text-sm text-tech-grey">
                          <span>Created {formatDate(poll.createdAt)}</span>
                          <span>{poll.options.length} options</span>
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
                    <p className="text-tech-grey">Check back later for new polls and surveys.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-tech-dark">Latest Announcements</h2>
            </div>
            
            <div className="grid gap-6">
              {Array.isArray(announcements) && announcements.length > 0 ? (
                announcements.map((announcement: Announcement) => (
                  <Card key={announcement.id} className="bg-white border-tech-grey/20 hover-lift">
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
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-tech-dark leading-relaxed">
                          {announcement.content}
                        </p>
                        
                                                 <div className="flex space-x-2">
                           <Button
                             variant="outline"
                             onClick={() => {
                               setSelectedAnnouncement(announcement);
                               fetchAnnouncementReplies(announcement.id);
                               setShowAnnouncementDetails(true);
                             }}
                             className="flex items-center space-x-2"
                           >
                             <MessageSquare className="h-4 w-4" />
                             <span>View Replies</span>
                           </Button>
                           {isAuthenticated && (
                             <Button
                               variant="outline"
                               onClick={() => {
                                 setSelectedAnnouncement(announcement);
                                 setShowReplyDialog(true);
                               }}
                               className="flex items-center space-x-2"
                             >
                               <MessageSquare className="h-4 w-4" />
                               <span>Reply</span>
                             </Button>
                           )}
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white border-tech-grey/20">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-tech-grey mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-tech-dark mb-2">No Announcements</h3>
                    <p className="text-tech-grey">No announcements at the moment. Check back later!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Course Library Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-tech-dark">Course Library</h2>
              {isAuthenticated && (
                <Badge variant="outline" className="text-tech-blue">
                  Access Granted
                </Badge>
              )}
            </div>
            
            {!isAuthenticated ? (
              <Card className="bg-white border-tech-grey/20">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-tech-grey mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-tech-dark mb-2">Authentication Required</h3>
                  <p className="text-tech-grey mb-4">
                    Please sign in to access our course library and learning resources.
                  </p>
                  <Button variant="outline">Sign In</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.isArray(courseLibrary) && courseLibrary.length > 0 ? (
                  courseLibrary.map((course: CourseLibrary) => (
                    <Card key={course.id} className="bg-white border-tech-grey/20 hover-lift">
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
                          <Button 
                            className="w-full tech-gradient text-white"
                            onClick={() => window.open(course.courseUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Access Course
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-white border-tech-grey/20 md:col-span-2 lg:col-span-3">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-12 w-12 text-tech-grey mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-tech-dark mb-2">No Courses Available</h3>
                      <p className="text-tech-grey">Course library is being populated. Check back soon!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Poll Vote Dialog */}
        <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vote in Poll</DialogTitle>
              <DialogDescription>
                {selectedPoll?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-tech-grey">
                You are about to vote for: <strong>{selectedPoll?.options[newPollResponse]}</strong>
              </p>
              <p className="text-sm text-tech-grey">
                Note: You can only vote once per poll.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPollDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedPoll && newPollResponse >= 0) {
                    handlePollVote(selectedPoll.id, newPollResponse);
                    setShowPollDialog(false);
                  }
                }}
              >
                Confirm Vote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

                 {/* Reply Dialog */}
         <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Reply to Announcement</DialogTitle>
               <DialogDescription>
                 {selectedAnnouncement?.title}
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4">
               <div>
                 <Label htmlFor="reply">Your Reply</Label>
                 <Textarea
                   id="reply"
                   placeholder="Type your reply here..."
                   value={newReply}
                   onChange={(e) => setNewReply(e.target.value)}
                   rows={4}
                 />
               </div>
             </div>
             <DialogFooter>
               <Button
                 variant="outline"
                 onClick={() => setShowReplyDialog(false)}
               >
                 Cancel
               </Button>
               <Button
                 onClick={() => {
                   if (selectedAnnouncement && newReply.trim()) {
                     handleAnnouncementReply(selectedAnnouncement.id, newReply.trim());
                   }
                 }}
                 disabled={!newReply.trim()}
               >
                 Post Reply
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

         {/* Announcement Replies Dialog */}
         <Dialog open={showAnnouncementDetails} onOpenChange={setShowAnnouncementDetails}>
           <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Announcement Replies</DialogTitle>
               <DialogDescription>
                 {selectedAnnouncement?.title}
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-tech-dark mb-2">Original Announcement</h4>
                 <p className="text-tech-grey">{selectedAnnouncement?.content}</p>
                 <p className="text-sm text-tech-grey mt-2">
                   Posted {selectedAnnouncement && formatDate(selectedAnnouncement.createdAt)}
                 </p>
               </div>
               
               <div>
                 <h4 className="font-semibold text-tech-dark mb-3">Replies ({announcementReplies.length})</h4>
                 {announcementReplies.length > 0 ? (
                   <div className="space-y-3">
                     {announcementReplies.map((reply) => (
                       <div key={reply.id} className="bg-white border border-gray-200 rounded-lg p-4">
                         <div className="flex items-start justify-between mb-2">
                           <span className="font-medium text-tech-blue">{reply.username}</span>
                           <span className="text-sm text-tech-grey">
                             {formatDate(reply.createdAt)}
                           </span>
                         </div>
                         <p className="text-tech-dark">{reply.content}</p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <MessageSquare className="h-8 w-8 text-tech-grey mx-auto mb-2" />
                     <p className="text-tech-grey">No replies yet. Be the first to reply!</p>
                   </div>
                 )}
               </div>
             </div>
             <DialogFooter>
               <Button
                 variant="outline"
                 onClick={() => setShowAnnouncementDetails(false)}
               >
                 Close
               </Button>
               {isAuthenticated && (
                 <Button
                   onClick={() => {
                     setShowAnnouncementDetails(false);
                     setShowReplyDialog(true);
                   }}
                 >
                   Add Reply
                 </Button>
               )}
             </DialogFooter>
           </DialogContent>
         </Dialog>

         {/* Poll Responses Dialog */}
         <Dialog open={showPollDetails} onOpenChange={setShowPollDetails}>
           <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Poll Responses</DialogTitle>
               <DialogDescription>
                 {selectedPoll?.title}
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-tech-dark mb-2">Poll Details</h4>
                 {selectedPoll?.description && (
                   <p className="text-tech-grey mb-2">{selectedPoll.description}</p>
                 )}
                 <div className="space-y-2">
                   {selectedPoll?.options.map((option, index) => (
                     <div key={index} className="flex items-center space-x-2">
                       <span className="text-sm font-medium text-tech-dark">{index + 1}.</span>
                       <span className="text-tech-grey">{option}</span>
                     </div>
                   ))}
                 </div>
                 <p className="text-sm text-tech-grey mt-2">
                   Created {selectedPoll && formatDate(selectedPoll.createdAt)}
                 </p>
               </div>
               
               <div>
                 <h4 className="font-semibold text-tech-dark mb-3">Responses ({pollResponses.length})</h4>
                 {pollResponses.length > 0 ? (
                   <div className="space-y-3">
                     {pollResponses.map((response) => (
                       <div key={response.id} className="bg-white border border-gray-200 rounded-lg p-4">
                         <div className="flex items-start justify-between mb-2">
                           <span className="font-medium text-tech-blue">{response.username}</span>
                           <span className="text-sm text-tech-grey">
                             {formatDate(response.createdAt)}
                           </span>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Vote className="h-4 w-4 text-tech-blue" />
                           <span className="text-tech-dark">
                             Voted for: <strong>{selectedPoll?.options[response.selectedOption]}</strong>
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <Vote className="h-8 w-8 text-tech-grey mx-auto mb-2" />
                     <p className="text-tech-grey">No responses yet. Be the first to vote!</p>
                   </div>
                 )}
               </div>
             </div>
             <DialogFooter>
               <Button
                 variant="outline"
                 onClick={() => setShowPollDetails(false)}
               >
                 Close
               </Button>
               {isAuthenticated && selectedPoll?.isActive && (
                 <Button
                   onClick={() => {
                     setShowPollDetails(false);
                     setShowPollDialog(true);
                   }}
                 >
                   Vote Now
                 </Button>
               )}
             </DialogFooter>
           </DialogContent>
         </Dialog>
      </div>
    </div>
  );
}
