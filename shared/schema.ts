import { pgTable, text, varchar, timestamp, integer, boolean, uuid, smallint, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  featured: integer("featured").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const galleryImages = pgTable("gallery_images", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey(),
  username: varchar("username").notNull().unique(),
  password: varchar("password").notNull(),
  email: varchar("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey(),
  eventId: varchar("event_id").notNull(),
  name: text("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aboutContent = pgTable("about_content", {
  id: varchar("id").primaryKey(),
  section: varchar("section").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New tables for role-based system and community features
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  password: varchar("password"), // Added password field for user login
  role: varchar("role").notNull().default("user"), // user, coordinator, super_admin
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const polls = pgTable("polls", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  options: text("options").array().notNull(), // Array of poll options
  createdBy: varchar("created_by").notNull(), // User ID who created the poll
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pollResponses = pgTable("poll_responses", {
  id: varchar("id").primaryKey(),
  pollId: varchar("poll_id").notNull(),
  userId: varchar("user_id").notNull(),
  username: varchar("username").notNull(),
  selectedOption: integer("selected_option").notNull(), // Index of selected option
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdBy: varchar("created_by").notNull(), // User ID who created the announcement
  isImportant: boolean("is_important").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const announcementReplies = pgTable("announcement_replies", {
  id: varchar("id").primaryKey(),
  announcementId: varchar("announcement_id").notNull(),
  userId: varchar("user_id").notNull(),
  username: varchar("username").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseLibrary = pgTable("course_library", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  courseUrl: text("course_url").notNull(),
  createdBy: varchar("created_by").notNull(), // User ID who created the course
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const technofest = pgTable("technofest", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").unique(),
  name: text("name").notNull(),
  number: integer("number"),
  category: text("category").notNull(),
  short_description: text("short_description").notNull(),
  description: text("description").notNull(),
  rules: jsonb("rules").notNull().default(sql`'[]'::jsonb`),
  youtube_url: text("youtube_url"),
  team_min: smallint("team_min").notNull(),
  team_max: smallint("team_max").notNull(),
  spline_right_url: text("spline_right_url"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const techfestRegistrations = pgTable("techfest_registrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  technofestId: uuid("technofest_id").notNull().references(() => technofest.id, { onDelete: "cascade" }),
  teamName: text("team_name").notNull(),
  teamLeaderName: text("team_leader_name").notNull(),
  teamLeaderEmail: text("team_leader_email").notNull(),
  contactEmail: text("contact_email").notNull(),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const registrationMembers = pgTable("registration_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationId: uuid("registration_id").notNull().references(() => techfestRegistrations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});


export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
});

export const insertAboutContentSchema = createInsertSchema(aboutContent).omit({
  id: true,
  updatedAt: true,
});

export const insertTechnofestSchema = createInsertSchema(technofest).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTechfestRegistrationSchema = createInsertSchema(techfestRegistrations).omit({
  id: true,
  createdAt: true,
});

export const insertRegistrationMemberSchema = createInsertSchema(registrationMembers).omit({
  id: true,
});

// New schemas for role-based system
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPollResponseSchema = createInsertSchema(pollResponses).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnouncementReplySchema = createInsertSchema(announcementReplies).omit({
  id: true,
  createdAt: true,
});

export const insertCourseLibrarySchema = createInsertSchema(courseLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  updatedAt: true,
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type AboutContent = typeof aboutContent.$inferSelect;
export type InsertAboutContent = z.infer<typeof insertAboutContentSchema>;

// New types for role-based system
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type PollResponse = typeof pollResponses.$inferSelect;
export type InsertPollResponse = z.infer<typeof insertPollResponseSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type AnnouncementReply = typeof announcementReplies.$inferSelect;
export type InsertAnnouncementReply = z.infer<typeof insertAnnouncementReplySchema>;
export type CourseLibrary = typeof courseLibrary.$inferSelect;
export type InsertCourseLibrary = z.infer<typeof insertCourseLibrarySchema>;

export type Technofest = typeof technofest.$inferSelect;
export type InsertTechnofest = z.infer<typeof insertTechnofestSchema>;

export type TechfestRegistration = typeof techfestRegistrations.$inferSelect;
export type InsertTechfestRegistration = z.infer<typeof insertTechfestRegistrationSchema>;

export type RegistrationMember = typeof registrationMembers.$inferSelect;
export type InsertRegistrationMember = z.infer<typeof insertRegistrationMemberSchema>;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;

