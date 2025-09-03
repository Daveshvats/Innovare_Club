import { 
  type Event, 
  type InsertEvent,
  type TeamMember,
  type InsertTeamMember,
  type GalleryImage,
  type InsertGalleryImage,
  type Admin,
  type InsertAdmin,
  type Registration,
  type InsertRegistration,
  type AboutContent,
  type InsertAboutContent,
  type User,
  type InsertUser,
  type Poll,
  type InsertPoll,
  type PollResponse,
  type InsertPollResponse,
  type Announcement,
  type InsertAnnouncement,
  type AnnouncementReply,
  type InsertAnnouncementReply,
  type CourseLibrary,
  type InsertCourseLibrary,
  type Technofest,
  type InsertTechnofest,
  type TechfestRegistration,
  type InsertTechfestRegistration,
  type RegistrationMember,
  type InsertRegistrationMember,
  technofest,
  techfestRegistrations,
  registrationMembers,
  events,
  teamMembers,
  galleryImages,
  admins,
  registrations,
  aboutContent,
  users,
  polls,
  pollResponses,
  announcements,
  announcementReplies,
  courseLibrary,
  siteSettings,
  type SiteSettings,
  type InsertSiteSettings
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, and, desc, lt } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Conditionally import database only when needed
let db: any;
let pool: any;

export interface IStorage {
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  cleanupOldEvents(): Promise<number>;
  unfeatureAllEvents(): Promise<void>; // Returns count of deleted events

  // Team Members
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;

  // Gallery
  getGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImage(id: string): Promise<GalleryImage | undefined>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: string, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: string): Promise<boolean>;

  // Admin Authentication
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Registrations
  getRegistrations(): Promise<Registration[]>;
  getRegistrationsByEvent(eventId: string): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistrationStatus(id: string, status: string): Promise<Registration | undefined>;
  deleteRegistration(id: string): Promise<boolean>;

  // About Content
  getAboutContent(): Promise<AboutContent[]>;
  getAboutContentBySection(section: string): Promise<AboutContent | undefined>;
  updateAboutContent(section: string, content: InsertAboutContent): Promise<AboutContent>;

  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  approveUser(id: string): Promise<User | undefined>;
  bulkCreateUsers(users: Array<{ username: string; email: string; password: string }>): Promise<User[]>;

  // Polls
  getPolls(): Promise<Poll[]>;
  getPoll(id: string): Promise<Poll | undefined>;
  createPoll(poll: InsertPoll): Promise<Poll>;
  updatePoll(id: string, poll: Partial<InsertPoll>): Promise<Poll | undefined>;
  deletePoll(id: string): Promise<boolean>;
  getPollWithResponses(id: string): Promise<{ poll: Poll; responses: PollResponse[]; totalVotes: number } | undefined>;

  // Poll Responses
  createPollResponse(response: InsertPollResponse): Promise<PollResponse>;
  getUserPollResponse(pollId: string, userId: string): Promise<PollResponse | undefined>;
  getPollResponses(pollId: string): Promise<PollResponse[]>;

  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;

  // Announcement Replies
  createAnnouncementReply(reply: InsertAnnouncementReply): Promise<AnnouncementReply>;
  getAnnouncementReplies(announcementId: string): Promise<AnnouncementReply[]>;

  // Poll Responses
  getPollResponses(pollId: string): Promise<PollResponse[]>;
  createPollResponse(response: InsertPollResponse): Promise<PollResponse>;

  // Course Library
  getCourseLibrary(): Promise<CourseLibrary[]>;
  getCourse(id: string): Promise<CourseLibrary | undefined>;
  createCourse(course: InsertCourseLibrary): Promise<CourseLibrary>;
  updateCourse(id: string, course: Partial<InsertCourseLibrary>): Promise<CourseLibrary | undefined>;
  deleteCourse(id: string): Promise<boolean>;
  
  // Initialize data
  initializeData(): Promise<void>;

  // Technofest
  getTechnofestEvents(): Promise<Technofest[]>;
  getTechnofestEvent(id: string): Promise<Technofest | undefined>;
  getTechnofestEventBySlug(slug: string): Promise<Technofest | undefined>;
  createTechnofestEvent(event: InsertTechnofest): Promise<Technofest>;
  updateTechnofestEvent(id: string, event: Partial<InsertTechnofest>): Promise<Technofest | undefined>;
  deleteTechnofestEvent(id: string): Promise<boolean>;
  getTechnofestEventsByCategory(category: string): Promise<Technofest[]>;
  getActiveTechnofestEvents(): Promise<Technofest[]>;

  // TECHNOFEST REGISTRATIONS
  getTechfestRegistrations(): Promise<TechfestRegistration[]>;
  getTechfestRegistrationsWithTeamCounts(): Promise<(TechfestRegistration & { memberCount: number })[]>;
  getTechfestRegistration(id: string): Promise<TechfestRegistration | undefined>;
  getTechfestRegistrationsByEvent(technofestId: string): Promise<TechfestRegistration[]>;
  createTechfestRegistration(registration: InsertTechfestRegistration): Promise<TechfestRegistration>;
  deleteTechfestRegistration(id: string): Promise<boolean>;
  updateTechfestRegistrationStatus(id: string, status: string): Promise<TechfestRegistration | undefined>;

  // REGISTRATION MEMBERS
  getRegistrationMembers(registrationId: string): Promise<RegistrationMember[]>;
  createRegistrationMember(member: InsertRegistrationMember): Promise<RegistrationMember>;
  deleteRegistrationMember(id: string): Promise<boolean>;
  bulkCreateRegistrationMembers(members: InsertRegistrationMember[]): Promise<RegistrationMember[]>;
  getAllRegistrationMembers(): Promise<RegistrationMember[]>;

  getSiteSetting(key: string): Promise<string | null>;
  setSiteSetting(key: string, value: string): Promise<void>;
  getAllSiteSettings(): Promise<SiteSettings[]>;

  // Test database connection and UUID generation
  testDatabaseConnection(): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private events: Map<string, Event> = new Map();
  private teamMembers: Map<string, TeamMember> = new Map();
  private galleryImages: Map<string, GalleryImage> = new Map();
  private admins: Map<string, Admin> = new Map();
  private registrations: Map<string, Registration> = new Map();
  private aboutContent: Map<string, AboutContent> = new Map();
  private users: Map<string, User> = new Map();
  private polls: Map<string, Poll> = new Map();
  private pollResponses: Map<string, PollResponse> = new Map();
  private announcements: Map<string, Announcement> = new Map();
  private announcementReplies: Map<string, AnnouncementReply> = new Map();
  private courseLibrary: Map<string, CourseLibrary> = new Map();
  private technofestEvents: Map<string, Technofest> = new Map();
  private techfestRegistrations: Map<string, TechfestRegistration> = new Map();
  private registrationMembers: Map<string, RegistrationMember> = new Map(); 
  private siteSettings: Map<string, SiteSettings> = new Map();

  constructor() {
    // Initialize with default admin
    const defaultAdminId = randomUUID();
    const defaultAdmin: Admin = {
      id: defaultAdminId,
      username: "admin",
      password: "admin123", // In real app, this should be hashed
      email: "admin@innovare.club",
      createdAt: new Date(),
    };
    this.admins.set(defaultAdminId, defaultAdmin);

    // Initialize default about content
    const heroContent: AboutContent = {
      id: randomUUID(),
      section: "hero",
      title: "Welcome to Innovare Technical Club",
      content: "Fostering innovation and technical excellence through collaborative learning and cutting-edge projects.",
      imageUrl: null,
      updatedAt: new Date(),
    };
    this.aboutContent.set("hero", heroContent);

    // Initialize default users
    const defaultUserId = randomUUID();
    const defaultUser: User = {
      id: defaultUserId,
      username: "demo_user",
      email: "demo@innovare.club",
      password: "password123",
      role: "user",
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(defaultUserId, defaultUser);

    const coordinatorId = randomUUID();
    const coordinatorUser: User = {
      id: coordinatorId,
      username: "coordinator",
      email: "coordinator@innovare.club",
      password: "password123",
      role: "coordinator",
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(coordinatorId, coordinatorUser);

    // Add your specific user
    const deepanshuId = randomUUID();
    const deepanshuUser: User = {
      id: deepanshuId,
      username: "deepanshu",
      email: "balharadeepanshu-013@gmail.com",
      password: "admin123",
      role: "super_admin",
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(deepanshuId, deepanshuUser);

    // Initialize default poll
    const defaultPollId = randomUUID();
    const defaultPoll: Poll = {
      id: defaultPollId,
      title: "What's your favorite programming language?",
      description: "Vote for your preferred programming language",
      options: ["JavaScript", "Python", "Java", "C++"],
      createdBy: defaultUserId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.polls.set(defaultPollId, defaultPoll);

    // Initialize default announcement
    const defaultAnnouncementId = randomUUID();
    const defaultAnnouncement: Announcement = {
      id: defaultAnnouncementId,
      title: "Welcome to Innovare!",
      content: "We are excited to have you join Innovare Technical Club. Stay tuned for upcoming events and opportunities.",
      createdBy: defaultUserId,
      isImportant: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.announcements.set(defaultAnnouncementId, defaultAnnouncement);
  
    const sampleTechfestId = randomUUID();
    const sampleTechfest: Technofest = {
      id: sampleTechfestId,
      slug: "web-dev-challenge",
      name: "Web Development Challenge",
      number: 1,
      category: "Development",
      shortDescription: "Build amazing web applications",
      description: "A comprehensive web development challenge where participants will build full-stack applications using modern technologies.",
      rules: ["Team size: 2-4 members", "48-hour deadline", "Use any framework", "Deploy your project"],
      youtubeUrl: "https://youtube.com/watch?v=example",
      teamMin: 2,
      teamMax: 4,
      splineRightUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.technofestEvents.set(sampleTechfestId, sampleTechfest);

  const defaultBgSetting: SiteSettings = {
      key: "background_spline_url",
      value: "https://prod.spline.design/DC0L-NagpocfiwmY/scene.splinecode",
      updatedAt: new Date(),
    };
    this.siteSettings.set("background_spline_url", defaultBgSetting);
  }

  // Initialize data method for consistency with DatabaseStorage
  async initializeData(): Promise<void> {
    // Data is already initialized in constructor
    console.log("In-memory storage initialized with default data");
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const newEvent: Event = { 
      ...event, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: event.tags || [],
      imageUrl: event.imageUrl || null,
      featured: event.featured || false,
      isActive: event.isActive !== undefined ? event.isActive : true,
      currentParticipants: event.currentParticipants || 0
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const existing = this.events.get(id);
    if (!existing) return undefined;
    const updated = { 
      ...existing, 
      ...event, 
      updatedAt: new Date() 
    };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  async cleanupOldEvents(): Promise<number> {
    // Delete events older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let deletedCount = 0;
    for (const [id, event] of this.events.entries()) {
      if (event.date < thirtyDaysAgo && !event.isActive) {
        this.events.delete(id);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async unfeatureAllEvents(): Promise<void> {
    for (const [id, event] of this.events.entries()) {
      if (event.featured) {
        this.events.set(id, { ...event, featured: false, updatedAt: new Date() });
      }
    }
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const newMember: TeamMember = { 
      ...member, 
      id, 
      createdAt: new Date(),
      imageUrl: member.imageUrl || null
    };
    this.teamMembers.set(id, newMember);
    return newMember;
  }

  async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const existing = this.teamMembers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...member };
    this.teamMembers.set(id, updated);
    return updated;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  // Gallery
  async getGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values());
  }

  async getGalleryImage(id: string): Promise<GalleryImage | undefined> {
    return this.galleryImages.get(id);
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const id = randomUUID();
    const newImage: GalleryImage = { 
      ...image, 
      id, 
      createdAt: new Date(),
      description: image.description || null
    };
    this.galleryImages.set(id, newImage);
    return newImage;
  }

  async updateGalleryImage(id: string, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const existing = this.galleryImages.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...image };
    this.galleryImages.set(id, updated);
    return updated;
  }

  async deleteGalleryImage(id: string): Promise<boolean> {
    return this.galleryImages.delete(id);
  }

  // Admin Authentication
  async getAdmin(id: string): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const newAdmin: Admin = { ...admin, id, createdAt: new Date() };
    this.admins.set(id, newAdmin);
    return newAdmin;
  }

  // Registrations
  async getRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values());
  }

  async getRegistrationsByEvent(eventId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(reg => reg.eventId === eventId);
  }

  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const newRegistration: Registration = { 
      ...registration, 
      id, 
      createdAt: new Date(),
      status: registration.status || "pending",
      phone: registration.phone || null
    };
    this.registrations.set(id, newRegistration);
    return newRegistration;
  }

  async updateRegistrationStatus(id: string, status: string): Promise<Registration | undefined> {
    const existing = this.registrations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status };
    this.registrations.set(id, updated);
    return updated;
  }

  async deleteRegistration(id: string): Promise<boolean> {
    return this.registrations.delete(id);
  }

  // About Content
  async getAboutContent(): Promise<AboutContent[]> {
    return Array.from(this.aboutContent.values());
  }

  async getAboutContentBySection(section: string): Promise<AboutContent | undefined> {
    return this.aboutContent.get(section);
  }

  async updateAboutContent(section: string, content: InsertAboutContent): Promise<AboutContent> {
    const id = randomUUID();
    const updated: AboutContent = { 
      ...content, 
      id, 
      section, 
      updatedAt: new Date(),
      imageUrl: content.imageUrl || null
    };
    this.aboutContent.set(section, updated);
    return updated;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Removed getUserByClerkId since we're not using Clerk

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    console.log(`Attempting to authenticate user: ${username}`);
    const user = Array.from(this.users.values()).find(user => user.username === username);
    console.log(`User found:`, user ? { username: user.username, isApproved: user.isApproved } : 'Not found');
    if (user && user.password === password && user.isApproved) {
      console.log(`Authentication successful for user: ${username}`);
      return user;
    }
    console.log(`Authentication failed for user: ${username}`);
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = { 
      ...user, 
      id, 
      role: user.role || "user", 
      password: user.password || null,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...user };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async approveUser(id: string): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, isApproved: true };
    this.users.set(id, updated);
    return updated;
  }

  async bulkCreateUsers(usersToCreate: Array<{ username: string; email: string; password: string }>): Promise<User[]> {
    const createdUsers: User[] = [];
    for (const user of usersToCreate) {
      const id = randomUUID();
      const newUser: User = {
        id,
        username: user.username,
        email: user.email,
        password: user.password,
        role: "user",
        isApproved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(id, newUser);
      createdUsers.push(newUser);
    }
    return createdUsers;
  }

  // Polls
  async getPolls(): Promise<Poll[]> {
    return Array.from(this.polls.values());
  }

  async getPoll(id: string): Promise<Poll | undefined> {
    return this.polls.get(id);
  }

  async createPoll(poll: InsertPoll): Promise<Poll> {
    const id = randomUUID();
    const newPoll: Poll = { 
      ...poll, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.polls.set(id, newPoll);
    return newPoll;
  }

  async updatePoll(id: string, poll: Partial<InsertPoll>): Promise<Poll | undefined> {
    const existing = this.polls.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...poll };
    this.polls.set(id, updated);
    return updated;
  }

  async deletePoll(id: string): Promise<boolean> {
    return this.polls.delete(id);
  }

  async getPollWithResponses(id: string): Promise<{ poll: Poll; responses: PollResponse[]; totalVotes: number } | undefined> {
    const poll = this.polls.get(id);
    if (!poll) return undefined;

    const responses = Array.from(this.pollResponses.values()).filter(
      (response) => response.pollId === id
    );
    const totalVotes = responses.length;

    return { poll, responses, totalVotes };
  }

  // Poll Responses
  async createPollResponse(response: InsertPollResponse): Promise<PollResponse> {
    const id = randomUUID();
    const newResponse: PollResponse = {
      ...response,
      id,
      createdAt: new Date(),
      selectedOption: response.selectedOption,
    };
    this.pollResponses.set(id, newResponse);
    return newResponse;
  }

  async getUserPollResponse(pollId: string, userId: string): Promise<PollResponse | undefined> {
    return Array.from(this.pollResponses.values()).find(
      (response) => response.pollId === pollId && response.userId === userId
    );
  }

  async getPollResponses(pollId: string): Promise<PollResponse[]> {
    return Array.from(this.pollResponses.values()).filter(
      (response) => response.pollId === pollId
    );
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values());
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const newAnnouncement: Announcement = {
      ...announcement,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const existing = this.announcements.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...announcement };
    this.announcements.set(id, updated);
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.announcements.delete(id);
  }

  // Announcement Replies
  async createAnnouncementReply(reply: InsertAnnouncementReply): Promise<AnnouncementReply> {
    const id = randomUUID();
    const newReply: AnnouncementReply = {
      ...reply,
      id,
      createdAt: new Date(),
    };
    this.announcementReplies.set(id, newReply);
    return newReply;
  }

  async getAnnouncementReplies(announcementId: string): Promise<AnnouncementReply[]> {
    return Array.from(this.announcementReplies.values()).filter(
      (reply) => reply.announcementId === announcementId
    );
  }

  async getPollResponses(pollId: string): Promise<PollResponse[]> {
    return Array.from(this.pollResponses.values()).filter(
      (response) => response.pollId === pollId
    );
  }

  // Course Library
  async getCourseLibrary(): Promise<CourseLibrary[]> {
    return Array.from(this.courseLibrary.values());
  }

  async getCourse(id: string): Promise<CourseLibrary | undefined> {
    return this.courseLibrary.get(id);
  }

  async createCourse(course: InsertCourseLibrary): Promise<CourseLibrary> {
    const id = randomUUID();
    const newCourse: CourseLibrary = {
      ...course,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.courseLibrary.set(id, newCourse);
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourseLibrary>): Promise<CourseLibrary | undefined> {
    const existing = this.courseLibrary.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...course };
    this.courseLibrary.set(id, updated);
    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    return this.courseLibrary.delete(id);
  }

  async getTechnofestEvents(): Promise<Technofest[]> {
    return Array.from(this.technofestEvents.values());
  }

  async getTechnofestEvent(id: string): Promise<Technofest | undefined> {
    return this.technofestEvents.get(id);
  }

  async getTechnofestEventBySlug(slug: string): Promise<Technofest | undefined> {
    return Array.from(this.technofestEvents.values()).find(event => event.slug === slug);
  }

  async createTechnofestEvent(event: InsertTechnofest): Promise<Technofest> {
    const id = randomUUID();
    const newEvent: Technofest = {
      ...event,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.technofestEvents.set(id, newEvent);
    return newEvent;
  }

  async updateTechnofestEvent(id: string, event: Partial<InsertTechnofest>): Promise<Technofest | undefined> {
    const existing = this.technofestEvents.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...event, updatedAt: new Date() };
    this.technofestEvents.set(id, updated);
    return updated;
  }

  async deleteTechnofestEvent(id: string): Promise<boolean> {
    return this.technofestEvents.delete(id);
  }

  async getTechnofestEventsByCategory(category: string): Promise<Technofest[]> {
    return Array.from(this.technofestEvents.values()).filter(event => event.category === category);
  }

  async getActiveTechnofestEvents(): Promise<Technofest[]> {
    return Array.from(this.technofestEvents.values()).filter(event => event.isActive);
  }

  // TECHNOFEST REGISTRATION METHODS
  async getTechfestRegistrations(): Promise<TechfestRegistration[]> {
    return Array.from(this.techfestRegistrations.values());
  }

  async getTechfestRegistrationsWithTeamCounts(): Promise<(TechfestRegistration & { memberCount: number })[]> {
    const registrations = Array.from(this.techfestRegistrations.values());
    const memberCounts = Array.from(this.registrationMembers.values()).reduce((acc, member) => {
      if (member.registrationId) {
        acc[member.registrationId] = (acc[member.registrationId] || 0) + 1;
      }
      return acc;
    }, {});

    return registrations.map(registration => {
      const memberCount = memberCounts[registration.id] || 0;
      return { ...registration, memberCount: memberCount + 1 }; // +1 for team leader
    });
  }

  async getTechfestRegistration(id: string): Promise<TechfestRegistration | undefined> {
    return this.techfestRegistrations.get(id);
  }

  async getTechfestRegistrationsByEvent(technofestId: string): Promise<TechfestRegistration[]> {
    return Array.from(this.techfestRegistrations.values()).filter(reg => reg.technofestId === technofestId);
  }

  async createTechfestRegistration(registration: InsertTechfestRegistration): Promise<TechfestRegistration> {
    const id = randomUUID();
    const newRegistration: TechfestRegistration = {
      ...registration,
      id,
      createdAt: new Date(),
    };
    this.techfestRegistrations.set(id, newRegistration);
    return newRegistration;
  }

  async deleteTechfestRegistration(id: string): Promise<boolean> {
    return this.techfestRegistrations.delete(id);
  }

  async updateTechfestRegistrationStatus(id: string, status: string): Promise<TechfestRegistration | undefined> {
    const existing = this.techfestRegistrations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status };
    this.techfestRegistrations.set(id, updated);
    return updated;
  }

  // REGISTRATION MEMBER METHODS
  async getRegistrationMembers(registrationId: string): Promise<RegistrationMember[]> {
    return Array.from(this.registrationMembers.values()).filter(member => member.registrationId === registrationId);
  }

  async getAllRegistrationMembers(): Promise<RegistrationMember[]> {
    return Array.from(this.registrationMembers.values());
  }

  async createRegistrationMember(member: InsertRegistrationMember): Promise<RegistrationMember> {
    const id = randomUUID();
    const newMember: RegistrationMember = {
      ...member,
      id,
    };
    this.registrationMembers.set(id, newMember);
    return newMember;
  }

  async deleteRegistrationMember(id: string): Promise<boolean> {
    return this.registrationMembers.delete(id);
  }

  async bulkCreateRegistrationMembers(members: InsertRegistrationMember[]): Promise<RegistrationMember[]> {
    const createdMembers: RegistrationMember[] = [];
    for (const member of members) {
      const created = await this.createRegistrationMember(member);
      createdMembers.push(created);
    }
    return createdMembers;
  }
  async getSiteSetting(key: string): Promise<string | null> {
    const setting = this.siteSettings.get(key);
    return setting?.value || null;
  }

  async setSiteSetting(key: string, value: string): Promise<void> {
    const setting: SiteSettings = {
      key,
      value,
      updatedAt: new Date(),
    };
    this.siteSettings.set(key, setting);
  }

  async getAllSiteSettings(): Promise<SiteSettings[]> {
    return Array.from(this.siteSettings.values());
  }

  // Test database connection and UUID generation
  async testDatabaseConnection(): Promise<boolean> {
    try {
      if (!db) {
        console.error("Database not initialized");
        return false;
      }
      
      // Test a simple query
      const result = await db.select().from(techfestRegistrations).limit(1);
      console.log("Database connection test successful");
      
      // Test UUID generation
      const testId = randomUUID();
      console.log("UUID generation test successful:", testId);
      
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }
}

export class DatabaseStorage implements IStorage {
  private static async initializeDatabase() {
    try {
      const dbModule = await import("./db");
      db = dbModule.db;
      pool = dbModule.pool;
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  async initializeData() {
    // Initialize database connection first
    await DatabaseStorage.initializeDatabase();
    
    // Check if admin exists, if not create default admin
    const existingAdmin = await db.select().from(admins).limit(1);
    if (existingAdmin.length === 0) {
      await db.insert(admins).values({
        id: randomUUID(),
        username: "admin",
        password: "admin123", // In real app, this should be hashed
        email: "admin@innovare.club",
      });
    }

    // Check if about content exists, if not create default
    const existingAbout = await db.select().from(aboutContent).limit(1);
    if (existingAbout.length === 0) {
      await db.insert(aboutContent).values({
        id: randomUUID(),
        section: "hero",
        title: "Welcome to Innovare Technical Club",
        content: "Fostering innovation and technical excellence through collaborative learning and cutting-edge projects.",
        imageUrl: null,
      });
    }

    // Check if users exist, if not create default users
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      await db.insert(users).values([
        {
          id: randomUUID(),
          username: "demo_user",
          email: "demo@innovare.club",
          password: "password123",
          role: "user",
          isApproved: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          username: "coordinator",
          email: "coordinator@innovare.club",
          password: "password123",
          role: "coordinator",
          isApproved: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          username: "deepanshu",
          email: "balharadeepanshu-013@gmail.com",
          password: "admin123",
          role: "super_admin",
          isApproved: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);
    }

    // Add sample events if none exist
    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length === 0) {
      await db.insert(events).values([
        {
          id: randomUUID(),
          title: "Tech Workshop 2024",
          description: "Join us for an intensive workshop on modern web development technologies.",
          date: new Date("2024-09-15"),
          location: "Main Auditorium",
          tags: ["workshop", "web-dev"],
          imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800",
          featured: 1,
        },
        {
          id: randomUUID(),
          title: "AI/ML Bootcamp",
          description: "Explore the fundamentals of Artificial Intelligence and Machine Learning.",
          date: new Date("2024-10-20"),
          location: "Computer Lab",
          tags: ["ai", "ml", "bootcamp"],
          imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
          featured: 0,
        }
      ]);
    }
    
    // Add sample gallery images if none exist
    const existingGallery = await db.select().from(galleryImages).limit(1);
    if (existingGallery.length === 0) {
      await db.insert(galleryImages).values([
        {
          id: randomUUID(),
          title: "Tech Workshop 2023",
          imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
          description: "Students collaborating on innovative projects",
        },
        {
          id: randomUUID(),
          title: "AI Hackathon",
          imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
          description: "24-hour hackathon focused on AI solutions",
        }
      ]);
    }
  }

  // Events
  async getEvents(): Promise<Event[]> {
    const eventsList = await db.select().from(events);
    
    // Fix any invalid dates in the events
    return eventsList.map(event => {
      if (event.date && event.date.toString() === 'Invalid Date') {
        console.log("Fixing invalid date in getEvents for event:", event.id);
        // Set a default future date if the date is invalid
        event.date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      }
      return event;
    });
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    
    if (event && event.date && event.date.toString() === 'Invalid Date') {
      console.log("Fixing invalid date in getEvent for event:", event.id);
      // Set a default future date if the date is invalid
      event.date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
    
    return event || undefined;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    console.log("DatabaseStorage createEvent - input:", event);
    console.log("DatabaseStorage createEvent - date field:", event.date);
    console.log("DatabaseStorage createEvent - date type:", typeof event.date);
    
    const id = randomUUID();
    const [newEvent] = await db
      .insert(events)
      .values({ 
        ...event, 
        id,
        tags: event.tags || [],
        imageUrl: event.imageUrl || null,
        featured: event.featured || false,
        isActive: event.isActive !== undefined ? event.isActive : true,
        currentParticipants: event.currentParticipants || 0,
        registrationType: event.registrationType || "dialog",
        registrationUrl: event.registrationUrl || null,
        updatedAt: new Date()
      })
      .returning();
    
    console.log("DatabaseStorage createEvent - output:", newEvent);
    console.log("DatabaseStorage createEvent - output date:", newEvent.date);
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    console.log("DatabaseStorage updateEvent - input:", event);
    console.log("DatabaseStorage updateEvent - date field:", event.date);
    console.log("DatabaseStorage updateEvent - date type:", typeof event.date);
    
    // Don't update date if it's invalid
    const updateData: any = { 
      ...event, 
      updatedAt: new Date() 
    };
    
    // Remove date from update if it's invalid
    if (event.date && (event.date.toString() === 'Invalid Date' || isNaN(new Date(event.date).getTime()))) {
      console.log("Removing invalid date from update");
      delete updateData.date;
    }
    
    const [updated] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    
    console.log("DatabaseStorage updateEvent - output:", updated);
    
    // Fix invalid dates in the returned data
    if (updated && updated.date && updated.date.toString() === 'Invalid Date') {
      console.log("Fixing invalid date in returned data");
      // Get the original event to preserve the valid date
      const originalEvent = await this.getEvent(id);
      if (originalEvent && originalEvent.date && originalEvent.date.toString() !== 'Invalid Date') {
        updated.date = originalEvent.date;
      } else {
        // If no valid date exists, set a default future date
        updated.date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      }
    }
    
    return updated || undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return (result.rowCount || 0) > 0;
  }

  async cleanupOldEvents(): Promise<number> {
    // Delete events older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.delete(events).where(
      and(
        lt(events.date, thirtyDaysAgo),
        eq(events.isActive, false) // Only delete inactive old events
      )
    );
    return result.rowCount || 0;
  }

  async unfeatureAllEvents(): Promise<void> {
    await db.update(events)
      .set({ 
        featured: false, 
        updatedAt: new Date() 
      })
      .where(eq(events.featured, true));
  }

  // Gallery Images
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).orderBy(desc(galleryImages.createdAt));
  }

  async getGalleryImage(id: string): Promise<GalleryImage | undefined> {
    const [image] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
    return image || undefined;
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const id = randomUUID();
    const [newImage] = await db
      .insert(galleryImages)
      .values({ 
        ...image, 
        id
      })
      .returning();
    return newImage;
  }

  async updateGalleryImage(id: string, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const [updated] = await db
      .update(galleryImages)
      .set(image)
      .where(eq(galleryImages.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteGalleryImage(id: string): Promise<boolean> {
    const result = await db.delete(galleryImages).where(eq(galleryImages.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member || undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const [newMember] = await db
      .insert(teamMembers)
      .values({ 
        ...member, 
        id,
        imageUrl: member.imageUrl || null
      })
      .returning();
    return newMember;
  }

  async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updated] = await db
      .update(teamMembers)
      .set(member)
      .where(eq(teamMembers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const result = await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Gallery
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages);
  }

  async getGalleryImage(id: string): Promise<GalleryImage | undefined> {
    const [image] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
    return image || undefined;
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const id = randomUUID();
    const [newImage] = await db
      .insert(galleryImages)
      .values({ 
        ...image, 
        id,
        description: image.description || null
      })
      .returning();
    return newImage;
  }

  async updateGalleryImage(id: string, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const [updated] = await db
      .update(galleryImages)
      .set(image)
      .where(eq(galleryImages.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteGalleryImage(id: string): Promise<boolean> {
    const result = await db.delete(galleryImages).where(eq(galleryImages.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Admin Authentication
  async getAdmin(id: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || undefined;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const [newAdmin] = await db
      .insert(admins)
      .values({ ...admin, id })
      .returning();
    return newAdmin;
  }

  // Registrations
  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations);
  }

  async getRegistrationsByEvent(eventId: string): Promise<Registration[]> {
    return await db.select().from(registrations).where(eq(registrations.eventId, eventId));
  }

  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const [newRegistration] = await db
      .insert(registrations)
      .values({ 
        ...registration, 
        id,
        status: registration.status || "pending",
        phone: registration.phone || null
      })
      .returning();
    return newRegistration;
  }

  async updateRegistrationStatus(id: string, status: string): Promise<Registration | undefined> {
    const [updated] = await db
      .update(registrations)
      .set({ status })
      .where(eq(registrations.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteRegistration(id: string): Promise<boolean> {
    const result = await db
      .delete(registrations)
      .where(eq(registrations.id, id));
    return result.rowCount > 0;
  }

  async updateTechfestRegistrationStatus(id: string, status: string): Promise<TechfestRegistration | undefined> {
    const [updated] = await db
      .update(techfestRegistrations)
      .set({ status })
      .where(eq(techfestRegistrations.id, id))
      .returning();
    return updated || undefined;
  }

  // About Content
  async getAboutContent(): Promise<AboutContent[]> {
    return await db.select().from(aboutContent);
  }

  async getAboutContentBySection(section: string): Promise<AboutContent | undefined> {
    const [content] = await db.select().from(aboutContent).where(eq(aboutContent.section, section));
    return content || undefined;
  }

  async updateAboutContent(section: string, content: InsertAboutContent): Promise<AboutContent> {
    const existing = await this.getAboutContentBySection(section);
    if (existing) {
      const [updated] = await db
        .update(aboutContent)
        .set({ ...content, updatedAt: new Date() })
        .where(eq(aboutContent.section, section))
        .returning();
      return updated;
    } else {
      const id = randomUUID();
      const [newContent] = await db
        .insert(aboutContent)
        .values({ 
          ...content, 
          id, 
          section,
          imageUrl: content.imageUrl || null
        })
        .returning();
      return newContent;
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  // Removed getUserByClerkId since we're not using Clerk

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    console.log(`Attempting to authenticate user: ${username}`);
    const [user] = await db.select().from(users).where(eq(users.username, username));
    console.log(`User found:`, user ? { username: user.username, isApproved: user.isApproved } : 'Not found');
    if (user && user.password === password && user.isApproved) {
      console.log(`Authentication successful for user: ${username}`);
      return user;
    }
    console.log(`Authentication failed for user: ${username}`);
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const [newUser] = await db
      .insert(users)
      .values({ 
        ...user, 
        id, 
        role: user.role || "user", 
        password: user.password || null,
        updatedAt: new Date() 
      })
      .returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async approveUser(id: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ isApproved: true })
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async bulkCreateUsers(usersToCreate: Array<{ username: string; email: string; password: string }>): Promise<User[]> {
    const createdUsers: User[] = [];
    for (const user of usersToCreate) {
      const id = randomUUID();
      const [newUser] = await db
        .insert(users)
        .values({
          id,
          username: user.username,
          email: user.email,
          password: user.password,
          role: "user",
          isApproved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      createdUsers.push(newUser);
    }
    return createdUsers;
  }

  // Polls
  async getPolls(): Promise<Poll[]> {
    return await db.select().from(polls);
  }

  async getPoll(id: string): Promise<Poll | undefined> {
    const [poll] = await db.select().from(polls).where(eq(polls.id, id));
    return poll || undefined;
  }

  async createPoll(poll: InsertPoll): Promise<Poll> {
    const id = randomUUID();
    const [newPoll] = await db
      .insert(polls)
      .values({ 
        ...poll, 
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newPoll;
  }

  async updatePoll(id: string, poll: Partial<InsertPoll>): Promise<Poll | undefined> {
    const [updated] = await db
      .update(polls)
      .set(poll)
      .where(eq(polls.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePoll(id: string): Promise<boolean> {
    const result = await db.delete(polls).where(eq(polls.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getPollWithResponses(id: string): Promise<{ poll: Poll; responses: PollResponse[]; totalVotes: number } | undefined> {
    const poll = await this.getPoll(id);
    if (!poll) return undefined;

    const responses = await db.select().from(pollResponses).where(eq(pollResponses.pollId, id));
    const totalVotes = responses.length;

    return { poll, responses, totalVotes };
  }

  // Poll Responses
  async createPollResponse(response: InsertPollResponse): Promise<PollResponse> {
    const id = randomUUID();
    const [newResponse] = await db
      .insert(pollResponses)
      .values({ 
        ...response, 
        id,
        createdAt: new Date(),
        selectedOption: response.selectedOption,
      })
      .returning();
    return newResponse;
  }

  async getUserPollResponse(pollId: string, userId: string): Promise<PollResponse | undefined> {
    const [response] = await db.select().from(pollResponses).where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.userId, userId)));
    return response || undefined;
  }

  async getPollResponses(pollId: string): Promise<PollResponse[]> {
    return await db.select().from(pollResponses).where(eq(pollResponses.pollId, pollId));
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements);
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement || undefined;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const [newAnnouncement] = await db
      .insert(announcements)
      .values({ 
        ...announcement, 
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [updated] = await db
      .update(announcements)
      .set(announcement)
      .where(eq(announcements.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const result = await db.delete(announcements).where(eq(announcements.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Announcement Replies
  async createAnnouncementReply(reply: InsertAnnouncementReply): Promise<AnnouncementReply> {
    const id = randomUUID();
    console.log("Creating announcement reply:", { ...reply, id });
    try {
      const [newReply] = await db
        .insert(announcementReplies)
        .values({ 
          ...reply, 
          id,
          createdAt: new Date(),
        })
        .returning();
      console.log("Announcement reply created successfully:", newReply);
      return newReply;
    } catch (error) {
      console.error("Error creating announcement reply:", error);
      throw error;
    }
  }

  async getAnnouncementReplies(announcementId: string): Promise<AnnouncementReply[]> {
    try {
      console.log("Fetching replies for announcement:", announcementId);
      const replies = await db.select().from(announcementReplies).where(eq(announcementReplies.announcementId, announcementId));
      console.log("Found replies:", replies);
      
      // If username column doesn't exist, we need to fetch usernames separately
      const repliesWithUsernames = await Promise.all(
        replies.map(async (reply) => {
          try {
            const user = await this.getUser(reply.userId);
            return {
              ...reply,
              username: user?.username || 'Unknown User'
            };
          } catch (error) {
            console.error("Error fetching user for reply:", error);
            return {
              ...reply,
              username: 'Unknown User'
            };
          }
        })
      );
      
      return repliesWithUsernames;
    } catch (error) {
      console.error("Error fetching announcement replies:", error);
      throw error;
    }
  }

  async getPollResponses(pollId: string): Promise<PollResponse[]> {
    try {
      const responses = await db.select().from(pollResponses).where(eq(pollResponses.pollId, pollId));
      
      // If username column doesn't exist, we need to fetch usernames separately
      const responsesWithUsernames = await Promise.all(
        responses.map(async (response) => {
          try {
            const user = await this.getUser(response.userId);
            return {
              ...response,
              username: user?.username || 'Unknown User'
            };
          } catch (error) {
            console.error("Error fetching user for response:", error);
            return {
              ...response,
              username: 'Unknown User'
            };
          }
        })
      );
      
      return responsesWithUsernames;
    } catch (error) {
      console.error("Error fetching poll responses:", error);
      throw error;
    }
  }

  // Course Library
  async getCourseLibrary(): Promise<CourseLibrary[]> {
    return await db.select().from(courseLibrary);
  }

  async getCourse(id: string): Promise<CourseLibrary | undefined> {
    const [course] = await db.select().from(courseLibrary).where(eq(courseLibrary.id, id));
    return course || undefined;
  }

  async createCourse(course: InsertCourseLibrary): Promise<CourseLibrary> {
    const id = randomUUID();
    const [newCourse] = await db
      .insert(courseLibrary)
      .values({ 
        ...course, 
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourseLibrary>): Promise<CourseLibrary | undefined> {
    const [updated] = await db
      .update(courseLibrary)
      .set(course)
      .where(eq(courseLibrary.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await db.delete(courseLibrary).where(eq(courseLibrary.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getTechnofestEvents(): Promise<Technofest[]> {
    return await db.select().from(technofest);
  }

  async getTechnofestEvent(id: string): Promise<Technofest | undefined> {
    const [event] = await db.select().from(technofest).where(eq(technofest.id, id));
    return event || undefined;
  }

  async getTechnofestEventBySlug(slug: string): Promise<Technofest | undefined> {
    const [event] = await db.select().from(technofest).where(eq(technofest.slug, slug));
    return event || undefined;
  }

  async createTechnofestEvent(event: InsertTechnofest): Promise<Technofest> {
    const [newEvent] = await db
      .insert(technofest)
      .values({
        ...event,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newEvent;
  }

  async updateTechnofestEvent(id: string, event: Partial<InsertTechnofest>): Promise<Technofest | undefined> {
    const [updated] = await db
      .update(technofest)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(technofest.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTechnofestEvent(id: string): Promise<boolean> {
    const result = await db.delete(technofest).where(eq(technofest.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getTechnofestEventsByCategory(category: string): Promise<Technofest[]> {
    return await db.select().from(technofest).where(eq(technofest.category, category));
  }

  async getActiveTechnofestEvents(): Promise<Technofest[]> {
    return await db.select().from(technofest).where(eq(technofest.isActive, true));
  }

  // TECHNOFEST REGISTRATION METHODS
  async getTechfestRegistrations(): Promise<TechfestRegistration[]> {
    return await db.select().from(techfestRegistrations);
  }

  async getTechfestRegistrationsWithTeamCounts(): Promise<(TechfestRegistration & { memberCount: number })[]> {
    const registrations = await db.select().from(techfestRegistrations);
    const memberCounts = await db
      .select({
        registrationId: registrationMembers.registrationId,
        count: sql<number>`count(*)::int`
      })
      .from(registrationMembers)
      .groupBy(registrationMembers.registrationId);

    return registrations.map(registration => {
      const memberCount = memberCounts.find(mc => mc.registrationId === registration.id)?.count || 0;
      return { ...registration, memberCount: memberCount + 1 }; // +1 for team leader
    });
  }

  async getTechfestRegistration(id: string): Promise<TechfestRegistration | undefined> {
    const [registration] = await db.select().from(techfestRegistrations).where(eq(techfestRegistrations.id, id));
    return registration || undefined;
  }

  async getTechfestRegistrationsByEvent(technofestId: string): Promise<TechfestRegistration[]> {
    return await db.select().from(techfestRegistrations).where(eq(techfestRegistrations.technofestId, technofestId));
  }

  async createTechfestRegistration(registration: InsertTechfestRegistration): Promise<TechfestRegistration> {
    try {
      // Check if database is available
      if (!db) {
        throw new Error("Database connection not available");
      }
      
      // Generate UUID in application layer to avoid database UUID generation issues
      const registrationId = randomUUID();
      console.log("Generated registration ID:", registrationId);
      
      const [newRegistration] = await db
        .insert(techfestRegistrations)
        .values({
          ...registration,
          id: registrationId,
          createdAt: new Date(),
        })
        .returning();
      
      console.log("Database returned registration:", newRegistration);
      
      // Ensure the ID is properly generated and valid
      if (!newRegistration || !newRegistration.id) {
        throw new Error("Failed to generate registration ID");
      }
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(newRegistration.id)) {
        console.error("Invalid UUID format returned:", newRegistration.id);
        throw new Error("Invalid UUID generated for registration");
      }
      
      console.log("Registration created successfully with ID:", newRegistration.id);
      return newRegistration;
    } catch (error) {
      console.error("Error creating techfest registration:", error);
      throw error;
    }
  }

  async deleteTechfestRegistration(id: string): Promise<boolean> {
    const result = await db.delete(techfestRegistrations).where(eq(techfestRegistrations.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateTechfestRegistrationStatus(id: string, status: string): Promise<TechfestRegistration | undefined> {
    const [updated] = await db
      .update(techfestRegistrations)
      .set({ status })
      .where(eq(techfestRegistrations.id, id))
      .returning();
    return updated || undefined;
  }

  // REGISTRATION MEMBER METHODS
  async getRegistrationMembers(registrationId: string): Promise<RegistrationMember[]> {
    return await db.select().from(registrationMembers).where(eq(registrationMembers.registrationId, registrationId));
  }

  async getAllRegistrationMembers(): Promise<RegistrationMember[]> {
    return await db.select().from(registrationMembers);
  }

  async createRegistrationMember(member: InsertRegistrationMember): Promise<RegistrationMember> {
    const [newMember] = await db
      .insert(registrationMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async deleteRegistrationMember(id: string): Promise<boolean> {
    const result = await db.delete(registrationMembers).where(eq(registrationMembers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async bulkCreateRegistrationMembers(members: InsertRegistrationMember[]): Promise<RegistrationMember[]> {
    try {
      console.log("Creating registration members:", members);
      console.log("First member registrationId:", members[0]?.registrationId);
      
      const createdMembers = await db
        .insert(registrationMembers)
        .values(members)
        .returning();
      
      console.log("Successfully created members:", createdMembers.length);
      return createdMembers;
    } catch (error) {
      console.error("Error in bulkCreateRegistrationMembers:", error);
      console.error("Members data:", members);
      throw error;
    }
  }

  async getSiteSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting?.value || null;
  }

  async setSiteSetting(key: string, value: string): Promise<void> {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ 
        target: siteSettings.key, 
        set: { value, updatedAt: new Date() } 
      });
  }

  async getAllSiteSettings(): Promise<SiteSettings[]> {
    return await db.select().from(siteSettings);
  }

  // Test database connection and UUID generation
  async testDatabaseConnection(): Promise<boolean> {
    try {
      if (!db) {
        console.error("Database not initialized");
        return false;
      }
      
      // Test a simple query
      const result = await db.select().from(techfestRegistrations).limit(1);
      console.log("Database connection test successful");
      
      // Test UUID generation
      const testId = randomUUID();
      console.log("UUID generation test successful:", testId);
      
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }
}

// Use in-memory storage for development when database is not available
let storage: IStorage;
try {
  // Try to use database storage if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    storage = new DatabaseStorage();
    // Initialize data on startup
    storage.initializeData().catch(console.error);
  } else {
    // Fallback to in-memory storage
    console.log("No DATABASE_URL found, using in-memory storage");
    storage = new MemStorage();
    // Initialize data on startup
    storage.initializeData().catch(console.error);
  }
} catch (error) {
  console.log("Database connection failed, using in-memory storage:", error);
  storage = new MemStorage();
  // Initialize data on startup
  storage.initializeData().catch(console.error);
}

export { storage };
