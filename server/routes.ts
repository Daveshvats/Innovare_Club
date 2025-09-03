import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertTeamMemberSchema, insertGalleryImageSchema, insertRegistrationSchema, insertAboutContentSchema, insertPollSchema, insertAnnouncementSchema, insertCourseLibrarySchema, insertPollResponseSchema, insertAnnouncementReplySchema, insertTechnofestSchema, insertTechfestRegistrationSchema, insertRegistrationMemberSchema } from "@shared/schema";

// Simple session storage for demo (use proper sessions in production)
const adminSessions = new Map<string, { id: string; username: string; email: string }>();

// Middleware to check admin authentication
const requireAuth = (req: any, res: any, next: any) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !adminSessions.has(sessionId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to check coordinator or super admin access
const requireCoordinatorOrSuperAdmin = (req: any, res: any, next: any) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !adminSessions.has(sessionId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // For now, we'll allow all authenticated admins to access coordinator features
  // In a real implementation, you'd check the user's role from the session
  next();
};

// Middleware to check super admin access only
const requireSuperAdmin = (req: any, res: any, next: any) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !adminSessions.has(sessionId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // For now, we'll allow all authenticated admins to access super admin features
  // In a real implementation, you'd check the user's role from the session
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Public APIs
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Gallery
  app.get("/api/gallery", async (req, res) => {
    try {
      const galleryImages = await storage.getGalleryImages();
      res.json(galleryImages);
    } catch (error) {
      console.error("Gallery fetch error:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Cleanup old events (auto-delete events older than 30 days)
  app.delete("/api/events/cleanup", async (req, res) => {
    try {
      const deletedCount = await storage.cleanupOldEvents();
      res.json({ message: `Cleaned up ${deletedCount} old events` });
    } catch (error) {
      console.error("Event cleanup error:", error);
      res.status(500).json({ message: "Failed to cleanup old events" });
    }
  });

  app.get("/api/team", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });



  app.get("/api/about", async (req, res) => {
    try {
      const content = await storage.getAboutContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch about content" });
    }
  });

  // Registration API
  app.post("/api/events/:id/register", async (req, res) => {
    try {
      const validatedData = insertRegistrationSchema.parse({
        ...req.body,
        eventId: req.params.id
      });
      const registration = await storage.createRegistration(validatedData);
      res.json(registration);
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });



  // New Community APIs (Public read access)
  app.get("/api/polls", async (req, res) => {
    try {
      const polls = await storage.getPolls();
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch polls" });
    }
  });

  app.get("/api/polls/:id", async (req, res) => {
    try {
      const pollWithResponses = await storage.getPollWithResponses(req.params.id);
      if (!pollWithResponses) {
        return res.status(404).json({ message: "Poll not found" });
      }
      res.json(pollWithResponses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch poll" });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.get("/api/announcements/:id", async (req, res) => {
    try {
      const announcement = await storage.getAnnouncement(req.params.id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      const replies = await storage.getAnnouncementReplies(req.params.id);
      res.json({ ...announcement, replies });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcement" });
    }
  });

  app.get("/api/course-library", async (req, res) => {
    try {
      const courses = await storage.getCourseLibrary();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course library" });
    }
  });

  app.get("/api/course-library/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // User Authentication
  app.post("/api/user/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`Login attempt for username: ${username}`);
      
      const user = await storage.authenticateUser(username, password);
      
      if (!user) {
        console.log(`Login failed for username: ${username}`);
        return res.status(401).json({ message: "Invalid credentials or user not approved" });
      }

      const sessionId = `user_session_${Date.now()}_${Math.random()}`;
      adminSessions.set(sessionId, { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      });
      
      console.log(`Login successful for username: ${username}`);
      res.json({ 
        token: sessionId, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role,
          isApproved: user.isApproved
        } 
      });
    } catch (error) {
      console.error("User login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Debug route to check available users (remove in production)
  app.get("/api/debug/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      })));
    } catch (error) {
      console.error("Debug users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // User Registration Request
  app.post("/api/user/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

             // Create user with pending approval
       const newUser = await storage.createUser({
         username,
         email,
         password,
         role: "user",
         isApproved: false
       });

      res.json({ 
        message: "Registration request submitted successfully. Please wait for admin approval.",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          isApproved: newUser.isApproved
        }
      });
    } catch (error) {
      console.error("User registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Admin Authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const sessionId = `session_${Date.now()}_${Math.random()}`;
      adminSessions.set(sessionId, { id: admin.id, username: admin.username, email: admin.email });
      
      res.json({ token: sessionId, admin: { id: admin.id, username: admin.username, email: admin.email } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", requireAuth, (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      adminSessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });

  // Users (Super Admin)
  app.get("/api/admin/users", requireSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/approve", requireSuperAdmin, async (req, res) => {
    try {
      const user = await storage.approveUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post("/api/admin/users/bulk", requireSuperAdmin, async (req, res) => {
    try {
      const { users } = req.body;
      if (!Array.isArray(users)) {
        return res.status(400).json({ message: "Users must be an array" });
      }
      const created = await storage.bulkCreateUsers(users);
      res.json({ count: created.length, users: created });
    } catch (error) {
      res.status(500).json({ message: "Failed to create users" });
    }
  });

  // Get all registrations (admin)
  app.get("/api/admin/registrations", requireAuth, async (req, res) => {
    try {
      const [regularRegistrations, techfestRegistrations] = await Promise.all([
        storage.getRegistrations(),
        storage.getTechfestRegistrationsWithTeamCounts()
      ]);
      
      // Combine and format all registrations
      const allRegistrations = [
        ...regularRegistrations.map(reg => ({
          ...reg,
          eventType: 'Event'
        })),
        ...techfestRegistrations.map(reg => ({
          ...reg,
          eventType: 'TechFest',
          eventId: reg.technofestId, // Map technofestId to eventId for consistency
          name: reg.teamName, // Map teamName to name for consistency
          email: reg.contactEmail, // Map contactEmail to email for consistency
          // Preserve all team information
          teamName: reg.teamName,
          teamLeaderName: reg.teamLeaderName,
          teamLeaderEmail: reg.teamLeaderEmail,
          contactEmail: reg.contactEmail
        }))
      ];
      
      res.json(allRegistrations);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.patch("/api/admin/registrations/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      
      // Try to update as regular registration first
      let registration = await storage.updateRegistrationStatus(req.params.id, status);
      
      // If not found, try as techfest registration
      if (!registration) {
        registration = await storage.updateTechfestRegistrationStatus(req.params.id, status);
      }
      
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json(registration);
    } catch (error) {
      console.error("Error updating registration status:", error);
      res.status(500).json({ message: "Failed to update registration" });
    }
  });

  // Delete registration endpoint
  app.delete("/api/admin/registrations/:id", requireAuth, async (req, res) => {
    try {
      // Try to delete as regular registration first
      let deleted = await storage.deleteRegistration(req.params.id);
      
      // If not found in regular registrations, try techfest registrations
      if (!deleted) {
        deleted = await storage.deleteTechfestRegistration(req.params.id);
      }
      
      if (!deleted) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json({ message: "Registration deleted successfully" });
    } catch (error) {
      console.error('Failed to delete registration:', error);
      res.status(500).json({ message: "Failed to delete registration" });
    }
  });

  app.get("/api/admin/registrations/csv", requireAuth, async (req, res) => {
    try {
      const [regularRegistrations, techfestRegistrations, events, techfestEvents] = await Promise.all([
        storage.getRegistrations(),
        storage.getTechfestRegistrationsWithTeamCounts(),
        storage.getEvents(),
        storage.getTechnofestEvents()
      ]);
      
      // Create event name lookup maps
      const eventNameMap = new Map(events.map(event => [event.id, event.title]));
      const techfestEventNameMap = new Map(techfestEvents.map(event => [event.id, event.name]));
      
      // Get team members for techfest registrations
      const techfestRegistrationsWithMembers = await Promise.all(
        techfestRegistrations.map(async (reg) => {
          const members = await storage.getRegistrationMembers(reg.id);
          return { ...reg, members };
        })
      );
      
      // Combine and format all registrations for CSV
      const allRegistrations = [
        ...regularRegistrations.map(reg => ({
          eventName: eventNameMap.get(reg.eventId) || 'Unknown Event',
          name: reg.name || 'N/A',
          email: reg.email || 'N/A',
          phone: reg.phone || 'N/A',
          eventId: reg.eventId,
          eventType: 'Event',
          status: reg.status || 'pending',
          createdAt: reg.createdAt
        })),
        ...techfestRegistrationsWithMembers.map(reg => ({
          eventName: techfestEventNameMap.get(reg.technofestId) || 'Unknown TechFest Event',
          teamName: reg.teamName || 'N/A',
          teamLeaderName: reg.teamLeaderName || 'N/A',
          teamLeaderEmail: reg.teamLeaderEmail || 'N/A',
          contactEmail: reg.contactEmail || 'N/A',
          members: reg.members.map(m => `${m.name || 'N/A'}${m.email ? ` (${m.email})` : ''}`).join('; '),
          eventId: reg.technofestId,
          eventType: 'TechFest',
          status: reg.status || 'pending',
          createdAt: reg.createdAt
        }))
      ];
      
      // CSV header
      const headers = ['Event Name', 'Event Type', 'Team Name', 'Team Leader', 'Team Leader Email', 'Contact Email', 'Team Members', 'Name', 'Email', 'Phone', 'Event ID', 'Status', 'Registration Date'];
      let csvContent = headers.join(',') + '\n';
      
      // CSV rows
      for (const registration of allRegistrations) {
        const row = [
          `"${registration.eventName || ''}"`,
          `"${registration.eventType || ''}"`,
          `"${registration.teamName || ''}"`,
          `"${registration.teamLeaderName || ''}"`,
          `"${registration.teamLeaderEmail || ''}"`,
          `"${registration.contactEmail || ''}"`,
          `"${registration.members || ''}"`,
          `"${registration.name || ''}"`,
          `"${registration.email || ''}"`,
          `"${registration.phone || ''}"`,
          `"${registration.eventId || ''}"`,
          `"${registration.status || 'pending'}"`,
          `"${registration.createdAt ? new Date(registration.createdAt).toISOString().split('T')[0] : ''}"`
        ];
        csvContent += row.join(',') + '\n';
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.send(csvContent);
    } catch (error) {
      console.error('CSV export error:', error);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  // Test endpoint for debugging dates
  app.post("/api/test-date", async (req, res) => {
    try {
      console.log("Test date endpoint - received data:", req.body);
      const testDate = new Date(req.body.date);
      console.log("Test date parsed:", testDate);
      console.log("Test date is valid:", !isNaN(testDate.getTime()));
      console.log("Test date ISO string:", testDate.toISOString());
      
      res.json({
        original: req.body.date,
        parsed: testDate,
        isValid: !isNaN(testDate.getTime()),
        isoString: testDate.toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Events
  app.post("/api/admin/events", requireAuth, async (req, res) => {
    try {
      console.log("Creating event with data:", req.body);
      console.log("Date field type:", typeof req.body.date);
      console.log("Date field value:", req.body.date);
      
      // Convert date string to Date object if it's a string
      const eventData = { ...req.body };
      if (eventData.date) {
        if (typeof eventData.date === 'string') {
          const parsedDate = new Date(eventData.date);
          if (isNaN(parsedDate.getTime())) {
            throw new Error(`Invalid date format: ${eventData.date}`);
          }
          eventData.date = parsedDate;
        } else if (typeof eventData.date === 'object' && eventData.date.$date) {
          // Handle MongoDB-style date objects
          eventData.date = new Date(eventData.date.$date);
        }
        console.log("Converted date:", eventData.date);
        console.log("Converted date timestamp:", eventData.date.getTime());
      }
      
      // If this event is being set as featured, unfeature all other events
      if (eventData.featured === 1 || eventData.featured === true) {
        console.log("Setting new featured event, unfeaturing others...");
        await storage.unfeatureAllEvents();
      }
      
      const validatedData = insertEventSchema.parse(eventData);
      console.log("Validated data:", validatedData);
      const event = await storage.createEvent(validatedData);
      console.log("Event created successfully:", event);
      res.json(event);
    } catch (error: any) {
      console.error("Event creation error:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          message: "Invalid event data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to create event", 
          error: error.message 
        });
      }
    }
  });

  app.patch("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      console.log("Updating event:", req.params.id, "with data:", req.body);
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      console.error("Event update error:", error);
      res.status(500).json({ 
        message: "Failed to update event", 
        error: error.message 
      });
    }
  });

  // Admin Event Management


  app.patch("/api/admin/events/:id", requireAuth, async (req, res) => {
    try {
      console.log("Updating event:", req.params.id, "with data:", req.body);
      console.log("Update date field type:", typeof req.body.date);
      console.log("Update date field value:", req.body.date);
      
      // Convert date string to Date object if it's a string
      const updateData = { ...req.body };
      if (updateData.date) {
        if (typeof updateData.date === 'string') {
          const parsedDate = new Date(updateData.date);
          if (isNaN(parsedDate.getTime())) {
            throw new Error(`Invalid date format: ${updateData.date}`);
          }
          updateData.date = parsedDate;
        } else if (typeof updateData.date === 'object' && updateData.date.$date) {
          // Handle MongoDB-style date objects
          updateData.date = new Date(updateData.date.$date);
        }
        console.log("Converted update date:", updateData.date);
        console.log("Converted update date timestamp:", updateData.date.getTime());
      }
      
      // If this event is being set as featured, unfeature all other events
      if (updateData.featured === 1 || updateData.featured === true) {
        console.log("Setting event as featured, unfeaturing others...");
        await storage.unfeatureAllEvents();
      }
      
      const event = await storage.updateEvent(req.params.id, updateData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      console.log("Event updated successfully:", event);
      res.json(event);
    } catch (error: any) {
      console.error("Event update error:", error);
      res.status(500).json({ 
        message: "Failed to update event", 
        error: error.message 
      });
    }
  });

  app.delete("/api/admin/events/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error: any) {
      console.error("Event deletion error:", error);
      res.status(500).json({ 
        message: "Failed to delete event", 
        error: error.message 
      });
    }
  });

  // Admin Gallery Routes
  app.post("/api/admin/gallery", requireAuth, async (req, res) => {
    try {
      console.log("Creating gallery image:", req.body);
      
      const galleryImage = await storage.createGalleryImage(req.body);
      console.log("Gallery image created successfully:", galleryImage);
      res.json(galleryImage);
    } catch (error: any) {
      console.error("Gallery image creation error:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to create gallery image", 
          error: error.message 
        });
      }
    }
  });

  app.patch("/api/admin/gallery/:id", requireAuth, async (req, res) => {
    try {
      console.log("Updating gallery image:", req.params.id, "with data:", req.body);
      
      const galleryImage = await storage.updateGalleryImage(req.params.id, req.body);
      if (!galleryImage) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      console.log("Gallery image updated successfully:", galleryImage);
      res.json(galleryImage);
    } catch (error: any) {
      console.error("Gallery image update error:", error);
      res.status(500).json({ 
        message: "Failed to update gallery image", 
        error: error.message 
      });
    }
  });

  app.delete("/api/admin/gallery/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteGalleryImage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      res.json({ message: "Gallery image deleted successfully" });
    } catch (error: any) {
      console.error("Gallery image deletion error:", error);
      res.status(500).json({ 
        message: "Failed to delete gallery image", 
        error: error.message 
      });
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Admin Team Members
  app.post("/api/team", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(validatedData);
      res.json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid team member data" });
    }
  });

  app.patch("/api/team/:id", requireAuth, async (req, res) => {
    try {
      const member = await storage.updateTeamMember(req.params.id, req.body);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete("/api/team/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTeamMember(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json({ message: "Team member deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  // Admin Gallery
  app.post("/api/gallery", requireAuth, async (req, res) => {
    try {
      const validatedData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(validatedData);
      res.json(image);
    } catch (error) {
      res.status(400).json({ message: "Invalid gallery image data" });
    }
  });

  app.delete("/api/gallery/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteGalleryImage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      res.json({ message: "Gallery image deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Admin About Content
  app.patch("/api/admin/about/:section", requireAuth, async (req, res) => {
    try {
      const validatedData = insertAboutContentSchema.parse(req.body);
      const content = await storage.updateAboutContent(req.params.section, validatedData);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: "Invalid about content data" });
    }
  });

  // New Admin APIs for role-based system
  // Poll Management (Coordinator and Super Admin)
  app.post("/api/admin/polls", requireCoordinatorOrSuperAdmin, async (req, res) => {
    try {
      // Get admin info from the session
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const admin = adminSessions.get(sessionId);
      
      if (!admin) {
        return res.status(401).json({ message: "Admin session not found" });
      }

      // Add createdBy field to the request body
      const pollData = {
        ...req.body,
        createdBy: admin.id // Use admin ID as createdBy
      };

      const validatedData = insertPollSchema.parse(pollData);
      const poll = await storage.createPoll(validatedData);
      res.json(poll);
    } catch (error: any) {
      console.error("Poll creation error:", error);
      res.status(400).json({ 
        message: "Invalid poll data", 
        details: error.errors || error.message 
      });
    }
  });

  app.patch("/api/admin/polls/:id", requireCoordinatorOrSuperAdmin, async (req, res) => {
    try {
      const poll = await storage.updatePoll(req.params.id, req.body);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      res.json(poll);
    } catch (error) {
      res.status(500).json({ message: "Failed to update poll" });
    }
  });

  app.delete("/api/admin/polls/:id", requireCoordinatorOrSuperAdmin, async (req, res) => {
    try {
      const deleted = await storage.deletePoll(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Poll not found" });
      }
      res.json({ message: "Poll deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete poll" });
    }
  });

  // Announcement Management (Coordinator and Super Admin)
  app.post("/api/admin/announcements", requireCoordinatorOrSuperAdmin, async (req, res) => {
    try {
      // Get admin info from the session
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const admin = adminSessions.get(sessionId);
      
      if (!admin) {
        return res.status(401).json({ message: "Admin session not found" });
      }

      // Add createdBy field to the request body
      const announcementData = {
        ...req.body,
        createdBy: admin.id // Use admin ID as createdBy
      };

      const validatedData = insertAnnouncementSchema.parse(announcementData);
      const announcement = await storage.createAnnouncement(validatedData);
      res.json(announcement);
    } catch (error: any) {
      console.error("Announcement creation error:", error);
      res.status(400).json({ 
        message: "Invalid announcement data", 
        details: error.errors || error.message 
      });
    }
  });

  app.patch("/api/admin/announcements/:id", requireCoordinatorOrSuperAdmin, async (req, res) => {
    try {
      const announcement = await storage.updateAnnouncement(req.params.id, req.body);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", requireCoordinatorOrSuperAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteAnnouncement(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Course Library Management (Coordinator and Super Admin)
  app.post("/api/admin/course-library", requireCoordinatorOrSuperAdmin, async (req, res) => {
    try {
      // Get admin info from the session
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const admin = adminSessions.get(sessionId);
      
      if (!admin) {
        return res.status(401).json({ message: "Admin session not found" });
      }

      // Add createdBy field to the request body
      const courseData = {
        ...req.body,
        createdBy: admin.id // Use admin ID as createdBy
      };

      const validatedData = insertCourseLibrarySchema.parse(courseData);
      const course = await storage.createCourse(validatedData);
      res.json(course);
    } catch (error: any) {
      console.error("Course creation error:", error);
      res.status(400).json({ 
        message: "Invalid course data", 
        details: error.errors || error.message 
      });
    }
  });

  // TechFest APIs
  app.get("/api/technofest", async (req, res) => {
    try {
      const events = await storage.getTechnofestEvents();
      res.json(events);
    } catch (error) {
      console.error("TechFest events fetch error:", error);
      res.status(500).json({ message: "Failed to fetch technofest events" });
    }
  });

  app.get("/api/technofest/:id", async (req, res) => {
    try {
      const event = await storage.getTechnofestEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "TechFest event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("TechFest event fetch error:", error);
      res.status(500).json({ message: "Failed to fetch technofest event" });
    }
  });


  // Admin TechFest Management
  app.post("/api/admin/technofest", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTechnofestSchema.parse(req.body);
      const event = await storage.createTechnofestEvent(validatedData);
      
      // Create Spline component if URL is provided
      if (event.spline_right_url) {
        try {
          const { componentGenerator } = await import("./component-generator");
          await componentGenerator.createSplineComponent(event.name, event.spline_right_url);
          console.log(`Created Spline component for event: ${event.name}`);
        } catch (componentError) {
          console.warn(`Failed to create component for event ${event.name}:`, componentError);
        }
      }
      
      res.json(event);
    } catch (error: any) {
      console.error("TechFest event creation error:", error);
      res.status(400).json({ 
        message: "Invalid technofest event data", 
        details: error.errors || error.message 
      });
    }
  });

  app.patch("/api/admin/technofest/:id", requireAuth, async (req, res) => {
    try {
      const oldEvent = await storage.getTechnofestEvent(req.params.id);
      const event = await storage.updateTechnofestEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ message: "TechFest event not found" });
      }
      
      // Handle Spline component updates
      if (event.spline_right_url !== oldEvent?.spline_right_url) {
        try {
          const { componentGenerator } = await import("./component-generator");
          
          // Delete old component if name changed or no URL
          if (oldEvent && (event.name !== oldEvent.name || !event.spline_right_url)) {
            await componentGenerator.deleteSplineComponent(oldEvent.name);
          }
          
          // Create new component if URL provided
          if (event.spline_right_url) {
            await componentGenerator.createSplineComponent(event.name, event.spline_right_url);
            console.log(`Updated Spline component for event: ${event.name}`);
          }
        } catch (componentError) {
          console.warn(`Failed to update component for event ${event.name}:`, componentError);
        }
      }
      
      res.json(event);
    } catch (error) {
      console.error("TechFest event update error:", error);
      res.status(500).json({ message: "Failed to update technofest event" });
    }
  });

  app.delete("/api/admin/technofest/:id", requireAuth, async (req, res) => {
    try {
      // Get event details before deletion for component cleanup
      const event = await storage.getTechnofestEvent(req.params.id);
      const deleted = await storage.deleteTechnofestEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "TechFest event not found" });
      }
      
      // Delete associated Spline component
      if (event) {
        try {
          const { componentGenerator } = await import("./component-generator");
          await componentGenerator.deleteSplineComponent(event.name);
          console.log(`Deleted Spline component for event: ${event.name}`);
        } catch (componentError) {
          console.warn(`Failed to delete component for event ${event.name}:`, componentError);
        }
      }
      
      res.json({ message: "TechFest event deleted successfully" });
    } catch (error) {
      console.error("TechFest event deletion error:", error);
      res.status(500).json({ message: "Failed to delete technofest event" });
    }
  });

  app.patch("/api/admin/course-library/:id", requireCoordinatorOrSuperAdmin, async (req, res) => {
    try {
      const course = await storage.updateCourse(req.params.id, req.body);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/admin/course-library/:id", requireCoordinatorOrSuperAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteCourse(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // User Interaction APIs (require authentication)
  app.post("/api/polls/:id/respond", async (req, res) => {
    try {
      const { username, selectedOption } = req.body;
      if (!username || selectedOption === undefined) {
        return res.status(400).json({ message: "Username and selected option are required" });
      }

      // Get user by username to validate and get user ID
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Create response data without username for now (until database is updated)
      const responseData = {
        pollId: req.params.id,
        userId: user.id,
        selectedOption
      };

      const response = await storage.createPollResponse(responseData);
      
      // Return response with username for display
      res.json({
        ...response,
        username: user.username
      });
    } catch (error: any) {
      console.error("Poll response creation error:", error);
      res.status(400).json({ 
        message: "Invalid poll response data", 
        details: error.errors || error.message 
      });
    }
  });

  app.post("/api/announcements/:id/reply", async (req, res) => {
    try {
      const { username, content } = req.body;
      if (!username || !content) {
        return res.status(400).json({ message: "Username and content are required" });
      }

      // Get user by username to validate and get user ID
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Create reply data without username for now (until database is updated)
      const replyData = {
        announcementId: req.params.id,
        userId: user.id,
        content
      };

      const reply = await storage.createAnnouncementReply(replyData);
      
      // Return reply with username for display
      res.json({
        ...reply,
        username: user.username
      });
    } catch (error: any) {
      console.error("Announcement reply creation error:", error);
      res.status(400).json({ 
        message: "Invalid reply data", 
        details: error.errors || error.message 
      });
    }
  });

  // Get announcement replies
  app.get("/api/announcements/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getAnnouncementReplies(req.params.id);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching announcement replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  // Get poll responses
  app.get("/api/polls/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getPollResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching poll responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  app.get("/api/technofest", async (req, res) => {
  try {
    const events = await storage.getTechnofestEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching technofest events:", error);
    res.status(500).json({ message: "Failed to fetch technofest events" });
  }
});

// Get specific technofest event by ID (public)
app.get("/api/technofest/:id", async (req, res) => {
  try {
    const event = await storage.getTechnofestEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Technofest event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching technofest event:", error);
    res.status(500).json({ message: "Failed to fetch technofest event" });
  }
});

// Technofest registration (public)
app.post("/api/technofest/:id/register", async (req, res) => {
  try {
    const { teamName, contactEmail, members } = req.body;
    
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Invalid registration data - members array required" });
    }

    // First member should be the team leader
    const teamLeader = members[0];
    if (!teamLeader || !teamLeader.name || !teamLeader.email) {
      return res.status(400).json({ message: "Team leader name and email are required" });
    }
    
    // Validate team size against event requirements
    const event = await storage.getTechnofestEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Technofest event not found" });
    }

    const validMembers = members.filter(m => m.name?.trim());
    if (validMembers.length < event.team_min || validMembers.length > event.team_max) {
      return res.status(400).json({ 
        message: `Team size must be between ${event.team_min} and ${event.team_max} members` 
      });
    }

    const registrationData = {
      technofestId: req.params.id,
      teamName: teamName.trim(),
      teamLeaderName: teamLeader.name.trim(),
      teamLeaderEmail: teamLeader.email.trim(),
      contactEmail: contactEmail.trim(),
    };

    // Create the main registration
    const registration = await storage.createTechfestRegistration(registrationData);
    
    // Validate the returned registration ID
    if (!registration || !registration.id) {
      throw new Error("Failed to create registration - no ID returned");
    }
    
    // Additional UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(registration.id)) {
      throw new Error("Invalid registration ID generated");
    }
    
    console.log("Created registration with ID:", registration.id);
    
    // Create additional registration members (skip the first member as it's the leader)
    if (validMembers.length > 1) {
      const memberData = validMembers.slice(1).map(member => ({
        registrationId: registration.id,
        name: member.name.trim(),
        email: member.email?.trim() || null,
      }));

      console.log("Creating members with registration ID:", registration.id);
      console.log("Member data to be created:", memberData);
      
      // Validate member data before sending to database
      for (const member of memberData) {
        if (!member.registrationId || typeof member.registrationId !== 'string') {
          throw new Error(`Invalid registration ID for member: ${member.name}`);
        }
        if (!member.name || typeof member.name !== 'string') {
          throw new Error(`Invalid name for member: ${member.registrationId}`);
        }
      }
      
      await storage.bulkCreateRegistrationMembers(memberData);
    }
    
    res.json({ 
      success: true,
      message: "Registration successful! You will receive a confirmation email shortly.",
      registration: {
        id: registration.id,
        teamName: registration.teamName,
        contactEmail: registration.contactEmail,
        technofestId: registration.technofestId,
      }
    });
  } catch (error: any) {
    console.error("Technofest registration error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Registration failed. Please try again.";
    
    if (error.message?.includes("UUID")) {
      errorMessage = "Registration system error - please contact support.";
    } else if (error.message?.includes("Failed to create registration")) {
      errorMessage = "Unable to process registration - please try again.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get("/api/admin/settings/:key", requireAuth, async (req, res) => {
  try {
    const value = await storage.getSiteSetting(req.params.key);
    if (value === null) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch setting" });
  }
});

// Update site setting
app.put("/api/admin/settings/:key", requireAuth, async (req, res) => {
  try {
    const { value } = req.body;
    if (!value) {
      return res.status(400).json({ message: "Value is required" });
    }
    
    await storage.setSiteSetting(req.params.key, value);
    res.json({ key: req.params.key, value, message: "Setting updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update setting" });
  }
});

// Get all site settings
app.get("/api/admin/settings", requireAuth, async (req, res) => {
  try {
    const settings = await storage.getAllSiteSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Test endpoint for debugging UUID generation
app.get("/api/test/uuid", async (req, res) => {
  try {
    const { randomUUID } = await import("crypto");
    const testId = randomUUID();
    
    res.json({ 
      success: true, 
      uuid: testId,
      timestamp: new Date().toISOString(),
      message: "UUID generation test successful"
    });
  } catch (error) {
    console.error("UUID test error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "UUID generation test failed"
    });
  }
});

// Test database connection
app.get("/api/test/db", async (req, res) => {
  try {
    const isConnected = await storage.testDatabaseConnection();
    res.json({ 
      success: true, 
      connected: isConnected,
      message: "Database connection test completed"
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Database connection test failed"
    });
  }
});

  // Get team members for a specific techfest registration
  app.get("/api/admin/registrations/:id/team-members", requireAuth, async (req, res) => {
    try {
      const teamMembers = await storage.getRegistrationMembers(req.params.id);
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Get all team members for all techfest registrations
  app.get("/api/admin/team-members", requireAuth, async (req, res) => {
    try {
      const allTeamMembers = await storage.getAllRegistrationMembers();
      res.json(allTeamMembers);
    } catch (error) {
      console.error("Error fetching all team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Get registrations for a specific event
  app.get("/api/admin/events/:eventId/registrations", requireAuth, async (req, res) => {
    try {
      const { eventId } = req.params;
      const { eventType } = req.query;
      
      let registrations = [];
      
      if (eventType === 'TechFest') {
        registrations = await storage.getTechfestRegistrationsWithTeamCounts();
        registrations = registrations.filter(reg => reg.technofestId === eventId);
        // Ensure all team information is preserved
        registrations = registrations.map(reg => ({
          ...reg,
          eventType: 'TechFest',
          eventId: reg.technofestId,
          name: reg.teamName,
          email: reg.contactEmail,
          // Preserve all team information
          teamName: reg.teamName,
          teamLeaderName: reg.teamLeaderName,
          teamLeaderEmail: reg.teamLeaderEmail,
          contactEmail: reg.contactEmail
        }));
      } else {
        registrations = await storage.getRegistrations();
        registrations = registrations.filter(reg => reg.eventId === eventId);
        registrations = registrations.map(reg => ({
          ...reg,
          eventType: 'Event'
        }));
      }
      
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      res.status(500).json({ message: "Failed to fetch event registrations" });
    }
  });

  // Get CSV for a specific event
  app.get("/api/admin/events/:eventId/registrations/csv", requireAuth, async (req, res) => {
    try {
      const { eventId } = req.params;
      const { eventType } = req.query;
      
      let registrations = [];
      
      if (eventType === 'TechFest') {
        registrations = await storage.getTechfestRegistrationsWithTeamCounts();
        registrations = registrations.filter(reg => reg.technofestId === eventId);
        
        // Get event name
        const event = await storage.getTechnofestEvent(eventId);
        const eventName = event ? event.name : 'Unknown TechFest Event';
        
        // Get team members for each registration
        const registrationsWithMembers = await Promise.all(
          registrations.map(async (reg) => {
            const members = await storage.getRegistrationMembers(reg.id);
            return { ...reg, members };
          })
        );
        
        // Format for CSV
        const csvData = registrationsWithMembers.map(reg => ({
          eventName: eventName,
          teamName: reg.teamName || 'N/A',
          teamLeaderName: reg.teamLeaderName || 'N/A',
          teamLeaderEmail: reg.teamLeaderEmail || 'N/A',
          contactEmail: reg.contactEmail || 'N/A',
          members: reg.members.map(m => `${m.name || 'N/A'}${m.email ? ` (${m.email})` : ''}`).join('; '),
          status: reg.status || 'pending',
          createdAt: reg.createdAt
        }));
        
        const csvContent = [
          'Event Name,Team Name,Team Leader,Team Leader Email,Contact Email,Team Members,Status,Registration Date',
          ...csvData.map(row => 
            `"${row.eventName}","${row.teamName}","${row.teamLeaderName}","${row.teamLeaderEmail}","${row.contactEmail}","${row.members}","${row.status}","${new Date(row.createdAt).toLocaleDateString()}"`
          )
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="techfest-${eventId}-registrations.csv"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.send(csvContent);
      } else {
        registrations = await storage.getRegistrations();
        registrations = registrations.filter(reg => reg.eventId === eventId);
        
        // Get event name
        const event = await storage.getEvent(eventId);
        const eventName = event ? event.title : 'Unknown Event';
        
        const csvData = registrations.map(reg => ({
          eventName: eventName,
          name: reg.name || 'N/A',
          email: reg.email || 'N/A',
          phone: reg.phone || 'N/A',
          status: reg.status || 'pending',
          createdAt: reg.createdAt
        }));
        
        const csvContent = [
          'Event Name,Name,Email,Phone,Status,Registration Date',
          ...csvData.map(row => 
            `"${row.eventName}","${row.name}","${row.email}","${row.phone}","${row.status}","${new Date(row.createdAt).toLocaleDateString()}"`
          )
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}-registrations.csv"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.send(csvContent);
      }
    } catch (error) {
      console.error("CSV export error:", error);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
